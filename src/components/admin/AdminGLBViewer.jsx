import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { Canvas, useThree, useLoader } from '@react-three/fiber';
import {
  OrbitControls,
  Html,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import {
  Box,
  Spinner,
  Text,
  Button,
  VStack,
  useToast,
  Divider,
  IconButton,
  useBreakpointValue,
  Flex,
  HStack,
  Badge,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
} from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon, CheckIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { gsap } from 'gsap';
import * as THREE from 'three';

// Import additional loaders explicitly
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

/* -------------------- Utility Function -------------------- */
const fitCameraToObject = (camera, controls, object, padding = 1.2) => {
  if (!object) {
    console.warn("fitCameraToObject: Object is null or undefined.");
    return;
  }
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);

  const fitHeightDistance = maxSize / (2 * Math.atan((Math.PI * camera.fov) / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = padding * Math.max(fitHeightDistance, fitWidthDistance);

  const newCameraPosition = new THREE.Vector3(
    center.x,
    center.y + size.y / 4,
    center.z + distance
  );

  gsap.to(camera.position, {
    duration: 1.5,
    x: newCameraPosition.x,
    y: newCameraPosition.y,
    z: newCameraPosition.z,
    onUpdate: () => controls.update(),
    ease: "power2.inOut",
  });

  gsap.to(controls.target, {
    duration: 1.5,
    x: center.x,
    y: center.y,
    z: center.z,
    onUpdate: () => controls.update(),
    ease: "power2.inOut",
  });
};

/* -------------------- Model Loader Components -------------------- */

const GltfModel = ({ url, onModelLoaded, onError }) => {
  const gltf = useLoader(GLTFLoader, url);
  useEffect(() => {
    onModelLoaded(gltf.scene);
  }, [gltf, onModelLoaded]);
  return <primitive object={gltf.scene} />;
};

const FbxModel = ({ url, onModelLoaded, onError }) => {
  const fbx = useLoader(FBXLoader, url);
  useEffect(() => {
    onModelLoaded(fbx);
  }, [fbx, onModelLoaded]);
  return <primitive object={fbx} />;
};

const ObjModel = ({ url, onModelLoaded, onError }) => {
  const obj = useLoader(OBJLoader, url);
  useEffect(() => {
    onModelLoaded(obj);
  }, [obj, onModelLoaded]);
  return <primitive object={obj} />;
};

/* -------------------- Model Display Wrapper -------------------- */
const ModelDisplay = ({ modelUrl, onModelLoad }) => {
  const [modelError, setModelError] = useState(null);
  const modelGroupRef = useRef();

  const extension = modelUrl.split('.').pop().toLowerCase();

  const handleModelLoaded = useCallback((loadedObject) => {
    setModelError(null);

    if (modelGroupRef.current) {
      modelGroupRef.current.add(loadedObject);

      const box = new THREE.Box3().setFromObject(loadedObject);
      const center = new THREE.Vector3();
      box.getCenter(center);

      modelGroupRef.current.position.set(-center.x, -box.min.y, -center.z);

      loadedObject.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          } else if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                  if (!mat.color) mat.color = new THREE.Color(0xcccccc);
                  if (!mat.isMeshStandardMaterial && !mat.isMeshPhysicalMaterial) {
                     mat.needsUpdate = true;
                  }
              });
          }
        }
      });
      onModelLoad(loadedObject);
    }
  }, [onModelLoad]);

  const handleLoaderError = useCallback((error) => {
      console.error("Loader encountered an error:", error);
      setModelError(error);
  }, []);

  const renderModel = () => {
    if (!modelUrl) return null;

    try {
      if (extension === 'glb' || extension === 'gltf') {
        return <GltfModel url={modelUrl} onModelLoaded={handleModelLoaded} onError={handleLoaderError} />;
      } else if (extension === 'fbx') {
        return <FbxModel url={modelUrl} onModelLoaded={handleModelLoaded} onError={handleLoaderError} />;
      } else if (extension === 'obj') {
        return <ObjModel url={modelUrl} onModelLoaded={handleModelLoaded} onError={handleLoaderError} />;
      } else {
        throw new Error(`Unsupported model file type: .${extension}. Supported: .glb, .gltf, .fbx, .obj`);
      }
    } catch (e) {
      useEffect(() => {
        setModelError(e);
      }, [e]);
      return null;
    }
  };

  if (modelError) {
    return (
      <Html center>
        <VStack spacing={4}>
          <Text color="red.500" fontSize="lg" fontWeight="bold">Error loading 3D model!</Text>
          <Text color="red.400" fontSize="sm">{modelError.message}</Text>
          <Text color="gray.500" fontSize="xs">
            Please check the model URL, file type, and ensure it's a valid 3D file.
          </Text>
        </VStack>
      </Html>
    );
  }

  return (
    <group ref={modelGroupRef}>
      {renderModel()}
    </group>
  );
};

/* -------------------- Camera Manager -------------------- */
const CameraManager = ({ modelScene, focusTarget }) => {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (modelScene && controls && (focusTarget === null || focusTarget === 'initial')) {
      fitCameraToObject(camera, controls, modelScene);
    }
  }, [modelScene, focusTarget, camera, controls]);

  useEffect(() => {
    if (focusTarget && Array.isArray(focusTarget) && controls) {
      const offset = { x: 0, y: 1.8, z: 3 };
      gsap.to(camera.position, {
        duration: 1.5,
        x: focusTarget[0] + offset.x,
        y: focusTarget[1] + offset.y,
        z: focusTarget[2] + offset.z,
        onUpdate: () => controls.update(),
        ease: "power2.inOut",
      });
      gsap.to(controls.target, {
        duration: 1.5,
        x: focusTarget[0],
        y: focusTarget[1],
        z: focusTarget[2],
        onUpdate: () => controls.update(),
        ease: "power2.inOut",
      });
    }
  }, [focusTarget, camera, controls]);

  return null;
};

/* -------------------- Click Interaction Handler -------------------- */
const ClickInteractionHandler = ({
  isClickToMoveEnabled,
  isSetupMode,
  isCreatingWalkthrough,
  setFocusTarget,
  setSetupPopup,
  onAddWalkthroughPoint,
}) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    let cursorStyle = 'grab';
    if (isCreatingWalkthrough) cursorStyle = 'copy';
    else if (isSetupMode) cursorStyle = 'cell';
    else if (isClickToMoveEnabled) cursorStyle = 'crosshair';
    gl.domElement.style.cursor = cursorStyle;
  }, [isClickToMoveEnabled, isSetupMode, isCreatingWalkthrough, gl.domElement.style]);

  const handleClick = useCallback((event) => {
    if (!isClickToMoveEnabled && !isSetupMode && !isCreatingWalkthrough) return;

    const bounds = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      if (isCreatingWalkthrough) {
        onAddWalkthroughPoint(point.toArray());
      } else if (isSetupMode) {
        setSetupPopup({
          position: point.toArray(),
          text: `[${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}]`,
        });
      } else if (isClickToMoveEnabled) {
        setFocusTarget(point.toArray());
      }
    }
  }, [gl, camera, scene, isClickToMoveEnabled, isSetupMode, isCreatingWalkthrough, setFocusTarget, setSetupPopup, onAddWalkthroughPoint]);

  useEffect(() => {
    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [gl.domElement, handleClick]);

  return null;
};

/* -------------------- Setup Popup -------------------- */
const SetupPopup = ({ position, text }) => {
  return (
    <Html position={position}>
      <Box bg="blackAlpha.700" color="white" p={2} borderRadius="md" transform="translate(-50%, -120%)" whiteSpace="nowrap">
        <HStack>
          <Text size="sm" color="primary.300">{text}</Text>
        </HStack>
      </Box>
    </Html>
  );
};

/* -------------------- Walkthrough Point Display -------------------- */
const WalkthroughPointMarker = ({ point, index, onRemove }) => {
  return (
    <Html position={point}>
      <Box bg="blue.500" color="white" p={1} borderRadius="full" transform="translate(-50%, -50%)">
        <HStack spacing={1}>
          <Text fontSize="xs" fontWeight="bold">{index + 1}</Text>
          <Tooltip label="Remove point">
            <IconButton
              size="xs"
              icon={<CloseIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              aria-label="Remove point"
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.600' }}
            />
          </Tooltip>
        </HStack>
      </Box>
    </Html>
  );
};

/* -------------------- Save Walkthrough Modal -------------------- */
const SaveWalkthroughModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  walkthroughPoints,
  existingWalkthroughs = [],
  modelUrl 
}) => {
  const [walkthroughName, setWalkthroughName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedWalkthrough, setSelectedWalkthrough] = useState('');

  const handleSave = () => {
    if (!walkthroughName.trim()) {
      alert('Please enter a walkthrough name');
      return;
    }
    
    // Check if name already exists
    if (existingWalkthroughs.some(wt => wt.name === walkthroughName)) {
      alert('A walkthrough with this name already exists. Please choose a different name.');
      return;
    }
    
    onSave({
      name: walkthroughName,
      points: walkthroughPoints,
      isDefault: isDefault,
      modelUrl: modelUrl
    });
    setWalkthroughName('');
    setIsDefault(false);
    onClose();
  };

  const handleUpdate = () => {
    if (!selectedWalkthrough) return;
    onSave({
      name: selectedWalkthrough,
      points: walkthroughPoints,
      isDefault: isDefault,
      modelUrl: modelUrl,
      update: true
    });
    setSelectedWalkthrough('');
    setIsDefault(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Save Walkthrough</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Save as New Walkthrough</FormLabel>
              <Input
                placeholder="Enter walkthrough name"
                value={walkthroughName}
                onChange={(e) => setWalkthroughName(e.target.value)}
              />
            </FormControl>

            {existingWalkthroughs.length > 0 && (
              <FormControl>
                <FormLabel>Or Update Existing Walkthrough</FormLabel>
                <Select
                  placeholder="Select walkthrough to update"
                  value={selectedWalkthrough}
                  onChange={(e) => setSelectedWalkthrough(e.target.value)}
                >
                  {existingWalkthroughs.map((wt) => (
                    <option key={wt.name} value={wt.name}>
                      {wt.name} {wt.isDefault && '(Default)'}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl display="flex" alignItems="center">
              <FormLabel mb={0} mr={2}>Set as default walkthrough</FormLabel>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </FormControl>

            <Box width="100%">
              <Text fontSize="sm" fontWeight="bold" mb={2}>Walkthrough Points:</Text>
              <Box maxH="120px" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
                {walkthroughPoints.map((point, index) => (
                  <Text key={index} fontSize="xs" fontFamily="mono">
                    Point {index + 1}: [{point.map(p => p.toFixed(2)).join(', ')}]
                  </Text>
                ))}
              </Box>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          {selectedWalkthrough ? (
            <Button colorScheme="blue" onClick={handleUpdate}>
              Update Walkthrough
            </Button>
          ) : (
            <Button colorScheme="primary" onClick={handleSave} isDisabled={!walkthroughName.trim()}>
              Save Walkthrough
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

/* -------------------- Storage Keys -------------------- */
const STORAGE_KEYS = {
  WALKTHROUGHS: (modelUrl) => `walkthroughs_${btoa(modelUrl)}`,
  DEFAULT_WALKTHROUGH: (modelUrl) => `default_walkthrough_${btoa(modelUrl)}`
};

/* -------------------- Real-time Walkthrough Sync Hook -------------------- */
const useWalkthroughSync = (modelUrl) => {
  const [savedWalkthroughs, setSavedWalkthroughs] = useState([]);
  const [defaultWalkthrough, setDefaultWalkthrough] = useState(null);

  useEffect(() => {
    if (!modelUrl) return;

    // Load initial walkthroughs
    const loadWalkthroughs = () => {
      const saved = localStorage.getItem(STORAGE_KEYS.WALKTHROUGHS(modelUrl));
      if (saved) {
        try {
          const walkthroughs = JSON.parse(saved);
          setSavedWalkthroughs(walkthroughs);
          
          // Find default walkthrough
          const defaultWT = walkthroughs.find(wt => wt.isDefault) || walkthroughs[0];
          setDefaultWalkthrough(defaultWT);
        } catch (error) {
          console.error('Error loading walkthroughs:', error);
          setSavedWalkthroughs([]);
          setDefaultWalkthrough(null);
        }
      } else {
        setSavedWalkthroughs([]);
        setDefaultWalkthrough(null);
      }
    };

    // Load initially
    loadWalkthroughs();

    // Listen for storage changes (when admin updates walkthroughs in other tabs)
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEYS.WALKTHROUGHS(modelUrl)) {
        loadWalkthroughs();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadWalkthroughs();
    };

    window.addEventListener('walkthroughUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('walkthroughUpdated', handleCustomStorageChange);
    };
  }, [modelUrl]);

  return { savedWalkthroughs, defaultWalkthrough };
};

/* -------------------- Main Admin Component -------------------- */
const AdminGLBViewer = ({ modelUrl }) => {
  const [modelScene, setModelScene] = useState(null);
  const [focusTarget, setFocusTarget] = useState('initial');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed to false by default
  const [isClickToMoveEnabled, setIsClickToMoveEnabled] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupPopup, setSetupPopup] = useState(null);
  const [isCreatingWalkthrough, setIsCreatingWalkthrough] = useState(false);
  const [dynamicWalkthroughPoints, setDynamicWalkthroughPoints] = useState([]);
  
  // Use the real-time sync hook
  const { savedWalkthroughs, defaultWalkthrough } = useWalkthroughSync(modelUrl);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

 const defaultFocusPoints = {
        entrance:[-3.89, 66.73, 19.46],        
        livingRoom: [-25.71, 81.17, 2.55],
        kitchen:[-24.35, 130.49, -28.89],
        bedroom: [32.00, 64.68, -8.94],
        bathroom: [-2.43, 65.42, -6.39],
        balcony:[-45.89, 25.42, -25.35],
    };


  const startWalkthrough = useCallback((pointsToUse = null, walkthroughName = 'Walkthrough') => {
    if (!modelScene) {
      toast({
        title: 'Model not loaded',
        description: 'Please wait for the model to load before starting a walkthrough.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    const walkthroughPoints = pointsToUse || 
      (defaultWalkthrough ? defaultWalkthrough.points : Object.values(defaultFocusPoints));

    if (walkthroughPoints.length < 2) {
      toast({
        title: 'Not enough walkthrough points',
        description: 'Please add at least 2 points to create a walkthrough.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let i = 0;
    const animateNextPoint = () => {
      if (i < walkthroughPoints.length) {
        setFocusTarget(walkthroughPoints[i]);
        i++;
        setTimeout(animateNextPoint, 3000);
      } else {
        toast({
          title: 'Walkthrough complete!',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        setFocusTarget('initial');
      }
    };
    animateNextPoint();

    toast({
      title: `Starting "${walkthroughName}"`,
      description: `Moving through ${walkthroughPoints.length} points.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  }, [modelScene, defaultFocusPoints, defaultWalkthrough, toast]);

  // Handlers for dynamic walkthrough creation
  const handleStartCreatingWalkthrough = useCallback(() => {
    setIsCreatingWalkthrough(true);
    setDynamicWalkthroughPoints([]);
    setSetupPopup(null);
    setIsSetupMode(false);
    setIsClickToMoveEnabled(false);
    toast({
      title: 'Creating New Walkthrough',
      description: 'Click on the model to add points. Click "Save" when done.',
      status: 'info',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  }, [toast]);

  const handleSaveWalkthrough = useCallback(() => {
    if (dynamicWalkthroughPoints.length < 2) {
      toast({
        title: 'Not enough points',
        description: 'Please add at least 2 points before saving.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    onOpen();
  }, [dynamicWalkthroughPoints, onOpen]);

  const handleSaveWalkthroughData = useCallback((walkthroughData) => {
    const { name, points, isDefault, update } = walkthroughData;
    
    let updatedWalkthroughs;
    
    if (update) {
      // Update existing walkthrough
      updatedWalkthroughs = savedWalkthroughs.map(wt => 
        wt.name === name ? { ...wt, points, isDefault } : wt
      );
    } else {
      // Add new walkthrough
      const newWalkthrough = { name, points, isDefault, modelUrl };
      updatedWalkthroughs = [...savedWalkthroughs, newWalkthrough];
    }

    // If setting as default, remove default from others
    if (isDefault) {
      updatedWalkthroughs = updatedWalkthroughs.map(wt => ({
        ...wt,
        isDefault: wt.name === name
      }));
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.WALKTHROUGHS(modelUrl), JSON.stringify(updatedWalkthroughs));

    // 🔥 TRIGGER REAL-TIME UPDATE FOR USER COMPONENT
    // Trigger storage event for other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.WALKTHROUGHS(modelUrl),
      newValue: JSON.stringify(updatedWalkthroughs)
    }));
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('walkthroughUpdated'));

    setIsCreatingWalkthrough(false);
    setDynamicWalkthroughPoints([]);

    toast({
      title: update ? 'Walkthrough Updated!' : 'Walkthrough Saved!',
      description: isDefault ? 'Set as default walkthrough - Users will see this immediately!' : 'Users can now see this walkthrough',
      status: 'success',
      duration: 4000,
      isClosable: true,
      position: 'top',
    });
  }, [savedWalkthroughs, modelUrl, toast]);

  const handleCancelWalkthrough = useCallback(() => {
    setIsCreatingWalkthrough(false);
    setDynamicWalkthroughPoints([]);
    toast({
      title: 'Walkthrough Creation Cancelled',
      status: 'error',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  }, [toast]);

  const handleAddWalkthroughPoint = useCallback((point) => {
    setDynamicWalkthroughPoints(prev => [...prev, point]);
    toast({
      title: `Point ${dynamicWalkthroughPoints.length + 1} added!`,
      description: `[${point.map(p => p.toFixed(2)).join(', ')}]`,
      status: 'info',
      duration: 1500,
      isClosable: false,
      position: 'bottom-right'
    });
  }, [dynamicWalkthroughPoints, toast]);

  const handleRemoveDynamicPoint = useCallback((indexToRemove) => {
    setDynamicWalkthroughPoints(prev => prev.filter((_, index) => index !== indexToRemove));
    toast({
      title: "Point removed",
      status: "info",
      duration: 1000,
      isClosable: false,
      position: "bottom-right",
    });
  }, [toast]);

  const handleDeleteWalkthrough = useCallback((walkthroughName) => {
    const updatedWalkthroughs = savedWalkthroughs.filter(wt => wt.name !== walkthroughName);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.WALKTHROUGHS(modelUrl), JSON.stringify(updatedWalkthroughs));

    // 🔥 TRIGGER REAL-TIME UPDATE FOR USER COMPONENT
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEYS.WALKTHROUGHS(modelUrl),
      newValue: JSON.stringify(updatedWalkthroughs)
    }));
    
    window.dispatchEvent(new CustomEvent('walkthroughUpdated'));

    toast({
      title: 'Walkthrough Deleted',
      description: 'Walkthrough has been removed from user view',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  }, [savedWalkthroughs, modelUrl, toast]);

  const toggleSetupMode = useCallback(() => {
    setIsSetupMode(prev => !prev);
    setSetupPopup(null);
    if (isCreatingWalkthrough) setIsCreatingWalkthrough(false);
    if (isClickToMoveEnabled) setIsClickToMoveEnabled(false);
    toast({
      title: `Setup Mode ${!isSetupMode ? 'Enabled' : 'Disabled'}`,
      description: !isSetupMode ? "Click on the model to get coordinates." : "",
      status: !isSetupMode ? "success" : "warning",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  }, [isSetupMode, isCreatingWalkthrough, isClickToMoveEnabled, toast]);

  const toggleClickToMove = useCallback(() => {
    setIsClickToMoveEnabled(prev => !prev);
    if (isSetupMode) setIsSetupMode(false);
    if (isCreatingWalkthrough) setIsCreatingWalkthrough(false);
    setSetupPopup(null);
    toast({
      title: `Click-to-Move ${!isClickToMoveEnabled ? 'Enabled' : 'Disabled'}`,
      status: !isClickToMoveEnabled ? "success" : "warning",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  }, [isClickToMoveEnabled, isSetupMode, isCreatingWalkthrough, toast]);

  if (!modelUrl) {
    return (
      <Box textAlign="center" p={8} bg="gray.100" borderRadius="md" m={4}>
        <Text fontSize="lg" color="gray.600">No model URL provided.</Text>
        <Text fontSize="sm" color="gray.500">Please provide a valid `modelUrl` prop to load a 3D model.</Text>
      </Box>
    );
  }

  const sidebarWidth = useBreakpointValue({ base: '80%', md: '380px' });
  const showHamburger = useBreakpointValue({ base: true, md: false });

  return (
    <Box w="100%" h="100vh" p={4} bg="gray.50" overflow="hidden">
      <Flex
        width="100%"
        height="100%"
        position="relative"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="xl"
        bg="white"
      >
        {/* Sidebar Toggle Button - Always visible */}
        <IconButton
          icon={isSidebarOpen ? <ChevronRightIcon /> : <HamburgerIcon />}
          aria-label="Toggle controls"
          position="absolute"
          top={4}
          left={4}
          zIndex={20}
          colorScheme="secondary"
          size="md"
          borderRadius="full"
          boxShadow="lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          transform={isSidebarOpen ? 'rotate(180deg)' : 'rotate(0)'}
          transition="transform 0.3s ease-in-out"
        />

        {/* Collapsible Sidebar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          height="100%"
          width={sidebarWidth}
          bg="whiteAlpha.950"
          p={4}
          boxShadow="2xl"
          transform={isSidebarOpen ? 'translateX(0)' : `translateX(-100%)`}
          transition="transform 0.4s ease-in-out"
          zIndex={15}
          overflowY="auto"
          borderRight="1px solid"
          borderColor="gray.200"
        >
          <VStack align="stretch" spacing={3}>
            <HStack justifyContent="space-between">
              <Text fontWeight="bold" fontSize="lg" color="primary.700">
                Admin Controls
              </Text>
              <IconButton
                icon={<CloseIcon />}
                aria-label="Close controls"
                size="sm"
                variant="ghost"
                onClick={() => setIsSidebarOpen(false)}
              />
            </HStack>
            <Divider />

            {isCreatingWalkthrough ? (
              <>
                <Text fontWeight="bold" fontSize="md" color="primary.600">
                  Creating New Walkthrough
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Click on the model to add points. Minimum 2 points required.
                </Text>
                
                <Box bg="blue.50" p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" color="blue.700">
                    Points Added: {dynamicWalkthroughPoints.length}
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    {dynamicWalkthroughPoints.length < 2 ? 'Add more points to enable save' : 'Ready to save!'}
                  </Text>
                </Box>

                <VStack
                  align="stretch"
                  spacing={1}
                  maxH="150px"
                  overflowY="auto"
                  bg="gray.50"
                  p={2}
                  borderRadius="md"
                >
                  {dynamicWalkthroughPoints.map((point, index) => (
                    <HStack key={index} bg="gray.100" p={1.5} borderRadius="md" justifyContent="space-between">
                      <Badge colorScheme="blue" fontSize="xs">P{index + 1}</Badge>
                      <Text fontSize="xs" flex="1" ml={2} fontFamily="mono">
                        [{point.map(p => p.toFixed(2)).join(', ')}]
                      </Text>
                      <Tooltip label="Remove Point" fontSize="xs">
                        <IconButton
                          size="xs"
                          icon={<CloseIcon />}
                          onClick={() => handleRemoveDynamicPoint(index)}
                          aria-label="Remove point"
                          variant="ghost"
                        />
                      </Tooltip>
                    </HStack>
                  ))}
                </VStack>
                
                <HStack>
                  <Button
                    colorScheme="primary"
                    onClick={handleSaveWalkthrough}
                    isDisabled={dynamicWalkthroughPoints.length < 2}
                    flex={1}
                  >
                    Save Walkthrough
                  </Button>
                  <Button variant="outline" onClick={handleCancelWalkthrough}>
                    Cancel
                  </Button>
                </HStack>
              </>
            ) : (
              <>
                {/* Walkthrough Status */}
                <Box bg="primary.50" p={3} borderRadius="md">
                  <Text fontSize="sm" fontWeight="bold" color="primary.700">
                    Walkthrough Status
                  </Text>
                  <Text fontSize="xs" color="primary.600">
                    {savedWalkthroughs.length > 0 
                      ? `${savedWalkthroughs.length} walkthrough${savedWalkthroughs.length !== 1 ? 's' : ''} saved` 
                      : 'No walkthroughs saved yet'
                    }
                  </Text>
                  {defaultWalkthrough && (
                    <Text fontSize="xs" color="primary.600" mt={1}>
                      Default: <strong>"{defaultWalkthrough.name}"</strong>
                    </Text>
                  )}
                </Box>

                <Button 
                  colorScheme="secondary" 
                  onClick={() => startWalkthrough(
                    defaultWalkthrough?.points, 
                    defaultWalkthrough?.name || 'Default Walkthrough'
                  )} 
                  isDisabled={!modelScene}
                  leftIcon={defaultWalkthrough ? <CheckIcon /> : undefined}
                >
                  {defaultWalkthrough ? `Test "${defaultWalkthrough.name}"` : 'Test Default Walkthrough'} 🚀
                </Button>

                {/* Saved Walkthroughs */}
                {savedWalkthroughs.length > 0 && (
                  <>
                    <Text fontWeight="bold" fontSize="sm" mt={3}>
                      Manage Walkthroughs
                    </Text>
                    {savedWalkthroughs.map((walkthrough) => (
                      <HStack key={walkthrough.name} spacing={2}>
                        <Button
                          flex={1}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={() => startWalkthrough(walkthrough.points, walkthrough.name)}
                          isDisabled={!modelScene}
                        >
                          <HStack width="100%" justify="space-between">
                            <Text>{walkthrough.name}</Text>
                            {walkthrough.isDefault && <Badge colorScheme="primary" fontSize="xs">Default</Badge>}
                          </HStack>
                        </Button>
                        <Tooltip label="Delete walkthrough">
                          <IconButton
                            size="sm"
                            icon={<CloseIcon />}
                            onClick={() => handleDeleteWalkthrough(walkthrough.name)}
                            aria-label="Delete walkthrough"
                            colorScheme="red"
                            variant="ghost"
                          />
                        </Tooltip>
                      </HStack>
                    ))}
                  </>
                )}

                <Text fontWeight="bold" fontSize="sm" mt={3}>
                  Quick Views
                </Text>
                {Object.entries(defaultFocusPoints).map(([name, pos]) => (
                  <Button
                    key={name}
                    size="sm"
                    variant="outline"
                    colorScheme="secondary"
                    onClick={() => setFocusTarget(pos)}
                    isDisabled={!modelScene}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)} 🔎
                  </Button>
                ))}

                <Divider my={2} />

                <Button
                  size="sm"
                  onClick={toggleClickToMove}
                  colorScheme={isClickToMoveEnabled ? 'orange' : 'blue'}
                  variant={isClickToMoveEnabled ? 'solid' : 'outline'}
                  isDisabled={!modelScene}
                >
                  {isClickToMoveEnabled ? "Disable Click-to-Move 🚫" : "Enable Click-to-Move 🖱️"}
                </Button>

                <Button
                  size="sm"
                  colorScheme="secondary"
                  variant="solid"
                  onClick={handleStartCreatingWalkthrough}
                  isDisabled={!modelScene}
                >
                  Create New Walkthrough ✨
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  mt={4}
                  onClick={() => setFocusTarget('initial')}
                  isDisabled={!modelScene}
                >
                  Reset View 🔁
                </Button>
                <Button
                  size="sm"
                  onClick={toggleSetupMode}
                  colorScheme={isSetupMode ? 'red' : 'purple'}
                  variant={isSetupMode ? 'solid' : 'outline'}
                  isDisabled={!modelScene}
                >
                  {isSetupMode ? "Exit Setup Mode" : "Enter Setup Mode 🛠️"}
                </Button>
              </>
            )}
          </VStack>
        </Box>

        {/* 3D Canvas */}
        <Box flex="1" height="100%" bg="gray.100">
          <Canvas shadows camera={{ position: [0, 2, 8], fov: 50 }}>
            <Suspense
              fallback={
                <Html center>
                  <VStack spacing={4}>
                    <Spinner size="xl" color="blue.500" thickness="4px" />
                    <Text fontSize="md" color="gray.600">Loading 3D model...</Text>
                  </VStack>
                </Html>
              }
            >
              <ambientLight intensity={0.7} />
              <Environment preset="city" />
              <ContactShadows
                position={[0, -0.8, 0]}
                opacity={0.5}
                width={10}
                height={10}
                blur={1.5}
                far={10}
                resolution={256}
              />
              {modelUrl && <ModelDisplay modelUrl={modelUrl} onModelLoad={setModelScene} />}
              <CameraManager modelScene={modelScene} focusTarget={focusTarget} />
              <OrbitControls makeDefault enablePan enableZoom enableRotate />
              <ClickInteractionHandler
                isClickToMoveEnabled={isClickToMoveEnabled}
                isSetupMode={isSetupMode}
                setFocusTarget={setFocusTarget}
                setSetupPopup={setSetupPopup}
                isCreatingWalkthrough={isCreatingWalkthrough}
                onAddWalkthroughPoint={handleAddWalkthroughPoint}
              />
              {setupPopup && <SetupPopup position={setupPopup.position} text={setupPopup.text} />}
              
              {/* Show walkthrough points when creating */}
              {isCreatingWalkthrough && dynamicWalkthroughPoints.map((point, index) => (
                <WalkthroughPointMarker
                  key={index}
                  point={point}
                  index={index}
                  onRemove={handleRemoveDynamicPoint}
                />
              ))}
            </Suspense>
          </Canvas>
        </Box>

        {/* Save Walkthrough Modal */}
        <SaveWalkthroughModal
          isOpen={isOpen}
          onClose={onClose}
          onSave={handleSaveWalkthroughData}
          walkthroughPoints={dynamicWalkthroughPoints}
          existingWalkthroughs={savedWalkthroughs}
          modelUrl={modelUrl}
        />
      </Flex>
    </Box>
  );
};

export default AdminGLBViewer;