import { useState, useRef } from 'react';
import { Box, Button, Flex, Heading, Stack, HStack, Text, StackDivider, Image as ChakraImage, CircularProgress } from '@chakra-ui/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Gallery.css';

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (event) => {
    setLoading(true);
    const fileList = event.target.files;
    const newImages = [];

    for (let i = 0; i < fileList.length; i++) {
      const image = await compressImage(fileList[i]);
      newImages.push(image);
    }

    setImages([...newImages, ...images]);
    setLoading(false);
  };

  const handleDragEnd = (dragIndex, dropIndex) => {
    const reorderedImages = Array.from(images);
    const [draggedImage] = reorderedImages.splice(dragIndex, 1);
    reorderedImages.splice(dropIndex, 0, draggedImage);

    setImages(reorderedImages);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <HStack flex={1} p={4} divider={<StackDivider borderColor='gray.200' />}>
        <Box p={4} flex={1} display={"flex"} alignItems="flex-start" justifyContent="center">
          <Box >
            <Heading mb={4}>Gallery App</Heading>
            <Stack direction="row" spacing={4} mb={4}>
              <input
                type="file"
                accept="image/jpeg,image/png"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                onChange={handleImageUpload}
              />
              <Button onClick={handleUploadButtonClick} colorScheme="blue">
                Upload
              </Button>
            </Stack>
          </Box>
        </Box>

        <Box p={4} flex={1}>
          {loading && (
            <Flex justify="center" m={4}>
              <CircularProgress isIndeterminate color="blue" />
            </Flex>
          )}

          <DndProvider backend={HTML5Backend}>
            <Flex
              direction="row"
              flexWrap="wrap"
              justify="space-between"
              className="image-container"
            >
              {images.map((image, index) => (
                <ImageBox
                  key={index}
                  index={index}
                  image={image}
                  handleDragEnd={handleDragEnd}
                />
              ))}
            </Flex>
          </DndProvider>

          {images.length === 0 && !loading && <Text>No images uploaded yet.</Text>}
        </Box>
      </HStack>
    </Box>
  );
}

function ImageBox({ index, image, handleDragEnd }) {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: 'IMAGE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'IMAGE',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const dropIndex = index;
      if (dragIndex === dropIndex) {
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < dropIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > dropIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      handleDragEnd(dragIndex, dropIndex);
      item.index = dropIndex;
    },
  });

  drag(drop(ref));

  return (
    <Box
      ref={ref}
      boxSize="30%"
      mb={1}
      opacity={isDragging ? 0.5 : 1}
      className="image-box"
    >
      <ChakraImage src={URL.createObjectURL(image)} alt={`Image ${index}`} boxSize='100%' objectFit='cover' style={{ borderRadius: '10px' }} />
    </Box>
  );
}

export default Gallery;
