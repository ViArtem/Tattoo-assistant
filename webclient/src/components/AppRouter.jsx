import React from "react";
import Home from "../pages/Home";
import { Routes, Route } from "react-router-dom";
//import RouteGuard from "./RouteGuard";

function AppRouter() {
  return (
    <Routes>
      <Route path="*" element={<Home />} /> //RouteGuard component={Home}
    </Routes>
  );
}

export default AppRouter;
