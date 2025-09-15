import { Outlet } from "react-router-dom";
import { NavBar } from "../components/NavBar/NavBar";
import { Footer } from "../components/footer/Footer";

export const RootLayout = () => {

    return (
        <>
            <NavBar />
            <Outlet />
        </>
    )
}