import { WindowSharp } from "@mui/icons-material"

export const Footer = () => {

    function scrollToTop() {
        window.scrollTo(0, 0);
    }

    return (
        <div className="footer">
            <div className="topFooter">
                <button className="toTop" onClick={scrollToTop}>
                    Volver arriba
                </button>
            </div>
            <div className="botFooter">
                
            </div>
        </div>
    )
}