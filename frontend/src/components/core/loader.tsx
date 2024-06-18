"use client";
import React from "react";
import { BiLoaderAlt } from "react-icons/bi";

const Loader = () => {
  return (
    <div className="w-max text-4xl animate-spin">
      <BiLoaderAlt />
    </div>
  );
};

export default Loader;
