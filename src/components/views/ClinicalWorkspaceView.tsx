import React from 'react';
import { DoctorWorkspacePage } from '../clinical/DoctorWorkspacePage';

export const ClinicalWorkspaceView: React.FC = () => {
  return <DoctorWorkspacePage appointmentId="apt-101" />;
};

export default ClinicalWorkspaceView;
