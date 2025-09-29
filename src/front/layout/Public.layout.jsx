import { Outlet } from "react-router-dom";
import { NavBar } from "../components/navbar/NavBar";
import { Footer } from "../components/footer/Footer";

export const PublicLayout = () => {

    return (
        <>
            <NavBar />
            <Outlet />
            <Footer />
        </>
    )
}