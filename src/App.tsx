import { useState, useRef } from 'react';
import { Box, Button, Flex, Heading, Stack, HStack, Text, StackDivider, Image } from '@chakra-ui/react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Gallery.css';

function Gallery() {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const fileList = event.target.files;
    const newImages = [];

    for (let i = 0; i < fileList.length; i++) {
      const image = URL.createObjectURL(fileList[i]);
      newImages.push(image);
    }

    setImages([...newImages, ...images]);
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

          {images.length === 0 && <Text>No images uploaded yet.</Text>}
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
      <Image src={image} alt={`Image ${index}`} boxSize='150px' objectFit='cover' style={{ width: '100%' }} />
    </Box>
  );
}

export default Gallery;
