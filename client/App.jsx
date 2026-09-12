import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { EventFlowProvider } from './context/EventFlowContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <EventFlowProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </EventFlowProvider>
  );
}
