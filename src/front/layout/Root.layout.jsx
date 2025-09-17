import { Outlet } from "react-router-dom";
import { Footer } from "../components/footer/Footer";
import { NavBar } from "../components/navbar/NavBar";

export const RootLayout = () => {

    return (
        <>
            <NavBar />
            <Outlet />
            <Footer/>
        </>
    )
}