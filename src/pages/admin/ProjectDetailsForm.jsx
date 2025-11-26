import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  Stack,
  Heading,
  VStack,
  HStack,
  useToast,
  Progress,
  Text,
  Image,
  AspectRatio,
  Alert,
  AlertIcon,
  Container,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaSave, FaCamera, FaCube } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ProjectDetailsForm = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [glbFile, setGlbFile] = useState(null);
  const [glbFileName, setGlbFileName] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(initialData?.coverImageUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingGlb, setIsUploadingGlb] = useState(false);
  const [glbUploadProgress, setGlbUploadProgress] = useState(0);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);

  const [glbUploadError, setGlbUploadError] = useState('');
  const [coverUploadError, setCoverUploadError] = useState('');

  const toast = useToast();
  const glbFileRef = useRef(null);
  const coverFileRef = useRef(null);

  useEffect(() => {
    const newFormData = initialData || {
      projectName: '', description: '', location: '',
      expectedCompletionDate: '', status: 'Planning',
      glbModelUrl: '', glbModelPublicId: '',
      coverImageUrl: '', coverImagePublicId: '',
    };
    setFormData(newFormData);
    setCoverImagePreview(newFormData.coverImageUrl || '');
    setGlbFileName(newFormData.glbModelUrl ? `Existing model: ${newFormData.glbModelUrl.split('/').pop()}` : '');
    setGlbFile(null);
    setCoverImageFile(null);
    if (glbFileRef.current) glbFileRef.current.value = '';
    if (coverFileRef.current) coverFileRef.current.value = '';
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGlbFileChange = (e) => {
    const file = e.target.files[0];
    setGlbUploadError(''); 
    const allowedExtensions = ['.glb', '.max', '.obj', '.fbx'];
    const fileExtension = file ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
    if (file && allowedExtensions.includes(fileExtension)) {
      setGlbFile(file);
      setGlbFileName(file.name);
    } else if (file) { // if there's a file but it's not allowed
      setGlbFile(null); // clear the file
      setGlbFileName(''); // clear the file name
      toast({ title: 'Invalid File Type', description: 'Please upload a .glb, .max, .obj, or .fbx file.', status: 'error' });
    }
  };

  const handleCoverImageFileChange = (e) => {
    const file = e.target.files[0];
    setCoverUploadError('');
    if (file) {
      // Validate both MIME type and file extension for maximum compatibility
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

      if (allowedMimeTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
        setCoverImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setCoverImageFile(null);
        toast({ title: 'Invalid File Type', description: 'Please upload a JPG, PNG, or GIF image.', status: 'error' });
      }
    }
  };

  const uploadFileToCloudinary = async (file, fileType, onProgress) => {
    setGlbUploadError('');
    setCoverUploadError('');
    let signatureData;
    try {
      const sigResponse = await fetch(`${API_BASE_URL}/api/admin/future-projects/cloudinary-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileType }),
      });
      if (!sigResponse.ok) throw new Error('Failed to get upload signature.');
      signatureData = await sigResponse.json();
    } catch (error) {
      console.error("Error getting signature:", error);
      if (fileType === 'glb') setGlbUploadError(`Signature error: ${error.message}`);
      if (fileType === 'cover') setCoverUploadError(`Signature error: ${error.message}`);
      throw error;
    }
    const formDataForCloudinary = new FormData();
    formDataForCloudinary.append('file', file);
    formDataForCloudinary.append('api_key', signatureData.apiKey);
    formDataForCloudinary.append('timestamp', signatureData.timestamp);
    formDataForCloudinary.append('signature', signatureData.signature);
    formDataForCloudinary.append('upload_preset', signatureData.uploadPreset);
    formDataForCloudinary.append('folder', signatureData.folder); 
    const resourceType = fileType === 'glb' ? 'raw' : 'image';
    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${resourceType}/upload`;
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', cloudinaryUploadUrl, true);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          if (onProgress) onProgress(percentCompleted);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error?.message || `Cloudinary upload failed: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Cloudinary upload failed: ${xhr.statusText} (Status: ${xhr.status})`));
          }
        }
      };
      xhr.onerror = () => reject(new Error('Network error during Cloudinary upload.'));
      xhr.send(formDataForCloudinary);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setGlbUploadError('');
    setCoverUploadError('');

    let projectDataToSave = { ...formData };

    try {
      if (glbFile) {
        setIsUploadingGlb(true);
        const glbResult = await uploadFileToCloudinary(glbFile, 'glb', setGlbUploadProgress);
        projectDataToSave.glbModelUrl = glbResult.secure_url;
        projectDataToSave.glbModelPublicId = glbResult.public_id;
        setIsUploadingGlb(false);
      }

      if (coverImageFile) {
        setIsUploadingCover(true);
        const coverResult = await uploadFileToCloudinary(coverImageFile, 'cover', setCoverUploadProgress);
        projectDataToSave.coverImageUrl = coverResult.secure_url;
        projectDataToSave.coverImagePublicId = coverResult.public_id;
        setIsUploadingCover(false);
      }
      
      await onSave(projectDataToSave);

      setGlbFile(null);
      setCoverImageFile(null);
      if (glbFileRef.current) glbFileRef.current.value = '';
      if (coverFileRef.current) coverFileRef.current.value = '';

    } catch (error) {
      console.error("Error during overall save process:", error);
      toast({
        title: 'Save Failed',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
      setIsUploadingGlb(false);
      setIsUploadingCover(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} bg="gray.50" minH="100vh" py={{ base: 6, md: 12 }}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          
          <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="lg" shadow="md">
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg" borderBottomWidth="1px" pb={3}>
                Project Information
              </Heading>
              
              <FormControl isRequired>
                <FormLabel htmlFor="projectName">Project Name</FormLabel>
                <Input id="projectName" name="projectName" value={formData.projectName || ''} onChange={handleChange} />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor="description">Description</FormLabel>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={5} />
              </FormControl>
              
              <FormControl>
                <FormLabel htmlFor="location">Location</FormLabel>
                <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel htmlFor="expectedCompletionDate">Expected Completion Date</FormLabel>
                  <Input type="date" id="expectedCompletionDate" name="expectedCompletionDate" value={formData.expectedCompletionDate?.split('T')[0] || ''} onChange={handleChange} />
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="status">Status</FormLabel>
                  <Select id="status" name="status" value={formData.status || 'Planning'} onChange={handleChange}>
                    <option value="Planning">Planning</option>
                    <option value="Pre-launch">Pre-launch</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Completed">Completed</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </Box>

          <Box bg="white" p={{ base: 5, md: 8 }} borderRadius="lg" shadow="md">
            <VStack spacing={6} align="stretch">
              <Heading as="h2" size="lg" borderBottomWidth="1px" pb={3}>
                Media Assets
              </Heading>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                
                <VStack spacing={3} align="stretch">
                  <FormLabel htmlFor="coverImageFile">Project Cover Image</FormLabel>
                  <AspectRatio ratio={16 / 9} w="100%">
                    <Box
                      borderColor="gray.300"
                      borderStyle="dashed"
                      borderWidth="2px"
                      rounded="md"
                      shadow="sm"
                      role="group"
                      transition="all 150ms ease-in-out"
                      _hover={{ shadow: 'md' }}
                      as="label"
                      cursor="pointer"
                      htmlFor="coverImageFile"
                      position="relative"
                    >
                      <Input type="file" id="coverImageFile" name="coverImageFile" accept="image/*" onChange={handleCoverImageFileChange} ref={coverFileRef} style={{ display: 'none' }} />
                      {coverImagePreview ? (
                        <Image src={coverImagePreview} alt="Cover preview" objectFit="cover" w="100%" h="100%" rounded="md" />
                      ) : (
                        <VStack h="100%" justifyContent="center">
                          <Icon as={FaCamera} boxSize={8} color="gray.400" />
                          <Text color="gray.500" fontWeight="medium">Click to upload</Text>
                        </VStack>
                      )}
                      <Box position="absolute" top="0" left="0" w="full" h="full" bg="blackAlpha.600" display="flex" justifyContent="center" alignItems="center" opacity="0" _groupHover={{ opacity: 1 }} transition="opacity 0.2s ease-in-out" rounded="md">
                        <HStack color="white">
                          <Icon as={FaCamera} boxSize={6} />
                          <Text fontWeight="semibold">Change Image</Text>
                        </HStack>
                      </Box>
                    </Box>
                  </AspectRatio>
                  {isUploadingCover && <Progress value={coverUploadProgress} size="xs" colorScheme="pink" mt={2} isAnimated hasStripe />}
                  {coverUploadError && <Alert status="error" mt={2}><AlertIcon />{coverUploadError}</Alert>}
                </VStack>

                <VStack spacing={3} align="stretch" justifyContent="center">
                  <FormControl>
                    <FormLabel htmlFor="glbFile">3D Model File (.glb, .max, .obj, .fbx)</FormLabel>
                    <Input type="file" id="glbFile" name="glbFile" accept=".glb,.max,.obj,.fbx" onChange={handleGlbFileChange} p={1.5} ref={glbFileRef} style={{ display: 'none' }}/>
                    <Button leftIcon={<FaCube />} w="full" onClick={() => glbFileRef.current.click()}>
                      Choose 3D Model File
                    </Button>
                    {glbFileName && (<Text fontSize="sm" color="gray.600" mt={2} noOfLines={1}>Selected: {glbFileName}</Text>)}
                    <FormHelperText mt={2}>
                      {formData.glbModelUrl && !glbFile && "An existing model is on the server."}
                    </FormHelperText>
                  </FormControl>
                  {isUploadingGlb && <Progress value={glbUploadProgress} size="xs" colorScheme="secondary" mt={2} isAnimated hasStripe />}
                  {glbUploadError && <Alert status="error" mt={2}><AlertIcon />{glbUploadError}</Alert>}
                </VStack>

              </SimpleGrid>
            </VStack>
          </Box>
          
          <Button
            size="lg"
            colorScheme="secondary"
            type="submit"
            isLoading={isSaving}
            loadingText="Saving Project..."
            leftIcon={<FaSave />}
          >
            Save Project
          </Button>

        </VStack>
      </Container>
    </Box>
  );
};
export default ProjectDetailsForm;