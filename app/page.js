import Image from "next/image";
import "./page.css";
import Home from "./components/Home/Home";
import Navbar from "./components/Navbar/Navbar";
export default function page() {
  return (
    <div className='pg'>
      <Navbar />
      <Home />
     
    </div>
  );
}
