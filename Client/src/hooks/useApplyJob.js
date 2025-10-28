import { useState } from 'react';

const useApplyJob = () => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleApplyClick = (task) => {
    setSelectedTask(task);
    setShowApplicationModal(true);
  };

  const handleCloseModal = () => {
    setShowApplicationModal(false);
    setSelectedTask(null);
  };

  return {
    showApplicationModal,
    selectedTask,
    handleApplyClick,
    handleCloseModal,
  };
};

export default useApplyJob;