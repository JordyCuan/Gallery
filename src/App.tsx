import { useState, useRef } from 'react';
import { Box, Button, Flex, Heading, Stack, HStack, Text, StackDivider, Image } from '@chakra-ui/react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [reorderedItem] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, reorderedItem);

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
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery">
              {(provided) => (
                <Flex
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  direction="row"
                  flexWrap="wrap"
                  justify="space-between"
                >
                  {images.map((image, index) => (
                    <Draggable key={index} draggableId={`image-${index}`} index={index}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          boxSize="30%"
                          mb={1}
                        >
                          <Image src={image} alt={`Image ${index}`} boxSize='150px' objectFit='cover' style={{ width: '100%' }} />
                        </Box>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Flex>
              )}
            </Droppable>
          </DragDropContext>

          {images.length === 0 && <Text>No images uploaded yet.</Text>}
        </Box>

        {/* <Box p={4} flex={1}></Box> */}
      </HStack>
    </Box>
  );
}

export default Gallery;
