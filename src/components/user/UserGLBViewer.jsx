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
} from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon, CheckIcon, StarIcon } from '@chakra-ui/icons';
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

/* -------------------- Storage Keys -------------------- */
const STORAGE_KEYS = {
  WALKTHROUGHS: (modelUrl) => `walkthroughs_${btoa(modelUrl)}`,
  DEFAULT_WALKTHROUGH: (modelUrl) => `default_walkthrough_${btoa(modelUrl)}`
};

/* -------------------- Real-time Walkthrough Sync -------------------- */
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

    // Listen for storage changes (when admin updates walkthroughs)
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

/* -------------------- Default Focus Points -------------------- */
const defaultFocusPoints = {
  entrance: { 
    position: [-3.89, 66.73, 19.46], 
    label: "Main Entrance",
    description: "Welcome to the main entrance"
  },
  livingRoom: { 
    position: [-25.71, 81.17, 2.55], 
    label: "Living Room",
    description: "Spacious living area"
  },
  kitchen: { 
    position:[-24.35, 130.49, -28.89],
    label: "Kitchen",
    description: "Modern kitchen space"
  },
  bedroom: { 
    position: [32.00, 64.68, -8.94],
    label: "Bedroom",
    description: "Comfortable bedroom"
  },
  bathroom: { 
    position: [-2.43, 65.42, -6.39],
    label: "Bathroom",
    description: "Elegant bathroom"
  },
  balcony: { 
    position:[-45.89, 25.42, -25.35], 
    label: "Balcony",
    description: "Beautiful balcony view"
  },
};

/* -------------------- Default Walkthrough Points -------------------- */
const getDefaultWalkthroughPoints = () => {
  return Object.values(defaultFocusPoints).map(point => point.position);
};

/* -------------------- Main User Viewer -------------------- */
const UserGLBViewer = ({ modelUrl }) => {
  const [modelScene, setModelScene] = useState(null);
  const [focusTarget, setFocusTarget] = useState('initial');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  
  // Use the real-time sync hook
  const { savedWalkthroughs, defaultWalkthrough } = useWalkthroughSync(modelUrl);

  const toast = useToast();

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

    // Use provided points, or default walkthrough points, or fallback to default focus points
    const walkthroughPoints = pointsToUse || 
      (defaultWalkthrough ? defaultWalkthrough.points : getDefaultWalkthroughPoints());

    if (walkthroughPoints.length < 2) {
      toast({
        title: 'No walkthrough points available',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setIsWalkthroughActive(true);
    let i = 0;
    
    const animateNextPoint = () => {
      if (i < walkthroughPoints.length) {
        setFocusTarget(walkthroughPoints[i]);
        i++;
        setTimeout(animateNextPoint, 3000);
      } else {
        setIsWalkthroughActive(false);
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
  }, [modelScene, defaultWalkthrough, toast]);

  const stopWalkthrough = useCallback(() => {
    setIsWalkthroughActive(false);
    setFocusTarget('initial');
    toast({
      title: 'Walkthrough stopped',
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top',
    });
  }, [toast]);

  // Check if admin has created any walkthroughs
  const hasAdminWalkthroughs = savedWalkthroughs.length > 0;
  const currentDefaultWalkthrough = defaultWalkthrough || (savedWalkthroughs.length > 0 ? savedWalkthroughs[0] : null);

  if (!modelUrl) {
    return (
      <Box textAlign="center" p={8} bg="gray.100" borderRadius="md">
        <Text fontSize="lg">No model available for this project.</Text>
      </Box>
    );
  }

  const sidebarWidth = useBreakpointValue({ base: '75%', md: '350px' });

  return (
    <Box w="100%" p={3} bg="gray.50">
      <Flex
        width="100%"
        height="70vh"
        position="relative"
        borderWidth="1px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="xl"
        bg="white"
        mr={{ base: 0, md: 6 }}
      >
        {/* Sidebar Toggle Button */}
        <IconButton
          icon={isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label="Toggle controls"
          position="absolute"
          top={4}
          left={4}
          zIndex={20}
          colorScheme="secondary"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Collapsible Sidebar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          height="100%"
          width={sidebarWidth}
          bg="whiteAlpha.900"
          p={4}
          boxShadow="lg"
          transform={isSidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth})`}
          transition="transform 0.4s ease-in-out"
          zIndex={15}
          overflowY="auto"
        >
          <VStack align="stretch" spacing={3}>
            <Text fontWeight="bold" fontSize="lg">
              Project Tour
            </Text>
            <Divider />

            {/* Walkthrough Status */}
            <Box bg={hasAdminWalkthroughs ? "primary.50" : "blue.50"} p={3} borderRadius="md">
              <HStack>
                <StarIcon color={hasAdminWalkthroughs ? "primary.500" : "blue.500"} />
                <Text fontSize="sm" fontWeight="bold" color={hasAdminWalkthroughs ? "primary.700" : "blue.700"}>
                  {hasAdminWalkthroughs ? "Custom Tour Available" : "Default Tour"}
                </Text>
              </HStack>
              <Text fontSize="xs" color={hasAdminWalkthroughs ? "primary.600" : "blue.600"}>
                {hasAdminWalkthroughs 
                  ? `Admin has created ${savedWalkthroughs.length} tour${savedWalkthroughs.length !== 1 ? 's' : ''}`
                  : "Using default building tour points"
                }
              </Text>
            </Box>

            {/* Stop Walkthrough Button (when active) */}
            {isWalkthroughActive && (
              <Button colorScheme="red" onClick={stopWalkthrough}>
                Stop Walkthrough ⏹️
              </Button>
            )}

            {/* Main Walkthrough Button */}
            {!isWalkthroughActive && (
              <Button 
                colorScheme="secondary" 
                onClick={() => startWalkthrough(
                  currentDefaultWalkthrough?.points, 
                  currentDefaultWalkthrough?.name || 'Building Tour'
                )} 
                isDisabled={!modelScene}
                leftIcon={<CheckIcon />}
              >
                {hasAdminWalkthroughs 
                  ? `Start "${currentDefaultWalkthrough?.name || 'Tour'}"` 
                  : 'Start Default Tour'
                } 🚀
              </Button>
            )}

            {/* Saved Walkthroughs List (Only show if admin created them) */}
            {hasAdminWalkthroughs && (
              <>
                <Text fontWeight="bold" fontSize="sm" mt={3}>
                  Available Tours
                </Text>
                {savedWalkthroughs.map((walkthrough) => (
                  <Button
                    key={walkthrough.name}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                    onClick={() => startWalkthrough(walkthrough.points, walkthrough.name)}
                    isDisabled={!modelScene || isWalkthroughActive}
                    justifyContent="flex-start"
                  >
                    <HStack width="100%" justify="space-between">
                      <Text>{walkthrough.name}</Text>
                      {walkthrough.isDefault && <Badge colorScheme="primary" fontSize="xs">Default</Badge>}
                    </HStack>
                  </Button>
                ))}
              </>
            )}

            {/* Default Focus Points (Always available) */}
            <Text fontWeight="bold" fontSize="sm" mt={3}>
              {hasAdminWalkthroughs ? "Quick Views" : "Explore Areas"}
            </Text>
            {Object.entries(defaultFocusPoints).map(([key, point]) => (
              <Button
                key={key}
                size="sm"
                variant="outline"
                colorScheme="secondary"
                onClick={() => setFocusTarget(point.position)}
                isDisabled={!modelScene || isWalkthroughActive}
              >
                <VStack spacing={0} width="100%">
                  <Text>{point.label}</Text>
                  <Text fontSize="xs" color="gray.600" fontWeight="normal">
                    {point.description}
                  </Text>
                </VStack>
              </Button>
            ))}

            <Button
              size="sm"
              variant="ghost"
              mt={4}
              onClick={() => setFocusTarget('initial')}
              isDisabled={!modelScene || isWalkthroughActive}
            >
              Reset View 🔁
            </Button>

            {/* Information Box */}
            <Box mt={2} p={2} bg="gray.50" borderRadius="md">
              <Text fontSize="xs" color="gray.600">
                💡 <strong>Tip:</strong> {hasAdminWalkthroughs 
                  ? "Admin has created custom tours for this project." 
                  : "Use the default tour to explore key areas of the building."
                }
              </Text>
            </Box>
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
            </Suspense>
          </Canvas>
        </Box>
      </Flex>
    </Box>
  );
};

export default UserGLBViewer;