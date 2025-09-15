import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TweenMax, Power1, Expo } from "gsap";
import "./3dBox.css";


export const AaaBox = () => {
    const containerRef = useRef();

    useEffect(() => {
        //--------------------------------------------------- BASIC parameters
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (window.innerWidth > 800) {
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.shadowMap.needsUpdate = true;
        }

        containerRef.current.appendChild(renderer.domElement);

        window.addEventListener("resize", onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        const camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            1,
            500
        );
        camera.position.set(0, 2, 14);

        const scene = new THREE.Scene();
        const city = new THREE.Object3D();
        const smoke = new THREE.Object3D();
        const town = new THREE.Object3D();

        let createCarPos = true;
        const uSpeed = 0.004;//No tocar mucho que marea!!!

        //--------------------------------------------------- FOG background
        const setcolor = 0xE2D4B0; //Color de la niebla
        scene.background = new THREE.Color(setcolor);
        scene.fog = new THREE.Fog(setcolor, 10, 16);

        //--------------------------------------------------- RANDOM Function
        function mathRandom(num = 8) {
            return -Math.random() * num + Math.random() * num;
        }

        //--------------------------------------------------- CHANGE building colors
        let setTintNum = true;
        function setTintColor() {
            setTintNum = !setTintNum;
            return 0x000000; // Puedes cambiar el color según quieras
        }

        //--------------------------------------------------- CREATE City
        function init() {
            const segments = 2;
            for (let i = 1; i < 100; i++) {
                const geometry = new THREE.BoxGeometry(1, 1, 1, segments, segments, segments); // <-- altura 1(1,0,0 lo deja plano )
                const material = new THREE.MeshStandardMaterial({
                    color: setTintColor(),
                    wireframe: false,
                    side: THREE.DoubleSide,
                });
                const wmaterial = new THREE.MeshLambertMaterial({
                    color: 0xffffff,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.03,
                    side: THREE.DoubleSide,
                });

                const cube = new THREE.Mesh(geometry, material)
                const wire = new THREE.Mesh(geometry, wmaterial)
                const floor = new THREE.Mesh(geometry, material)
                const wfloor = new THREE.Mesh(geometry, wmaterial)

                cube.add(wfloor);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.rotationValue = 0.1 + Math.abs(mathRandom(8))

                floor.scale.y = 0.05
                cube.scale.y = 0.1 + Math.abs(mathRandom(8))
                const cubeWidth = 0.9;
                cube.scale.x = cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth)

                cube.position.x = Math.round(mathRandom())
                cube.position.z = Math.round(mathRandom())

                floor.position.set(cube.position.x, 0, cube.position.z)

                town.add(floor);
                town.add(cube);
            }

            //--------------------------------------------------- Particular (particles)
            const gmaterial = new THREE.MeshToonMaterial({ color: 0xffff00, side: THREE.DoubleSide })
            const gparticular = new THREE.CircleGeometry(0.01, 3)
            const aparticular = 5

            for (let h = 1; h < 300; h++) {
                const particular = new THREE.Mesh(gparticular, gmaterial)
                particular.position.set(
                    mathRandom(aparticular),
                    mathRandom(aparticular),
                    mathRandom(aparticular)
                );
                particular.rotation.set(mathRandom(), mathRandom(), mathRandom())
                smoke.add(particular);
            }

            const pmaterial = new THREE.MeshPhongMaterial({
                color: 0x000000,
                side: THREE.DoubleSide,
                roughness: 10,
                metalness: 0.6,
                opacity: 0.9,
                transparent: true,
            });
            const pgeometry = new THREE.PlaneGeometry(60, 60)
            const pelement = new THREE.Mesh(pgeometry, pmaterial)
            pelement.rotation.x = -Math.PI / 2;
            pelement.position.y = -0.001;
            pelement.receiveShadow = true;

            city.add(pelement);
        }

        //--------------------------------------------------- MOUSE functions
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        function onMouseMove(event) {
            event.preventDefault()
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
        }

        function onDocumentTouchStart(event) {
            if (event.touches.length === 1) {
                event.preventDefault();
                mouse.x = event.touches[0].pageX - window.innerWidth / 2
                mouse.y = event.touches[0].pageY - window.innerHeight / 2
            }
        }

        function onDocumentTouchMove(event) {
            if (event.touches.length === 1) {
                event.preventDefault()
                mouse.x = event.touches[0].pageX - window.innerWidth / 2
                mouse.y = event.touches[0].pageY - window.innerHeight / 2
            }
        }

        window.addEventListener("mousemove", onMouseMove, false)
        window.addEventListener("touchstart", onDocumentTouchStart, false)
        window.addEventListener("touchmove", onDocumentTouchMove, false)

        //--------------------------------------------------- Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 4)
        const lightFront = new THREE.SpotLight(0xffffff, 20, 10)
        const lightBack = new THREE.PointLight(0xffffff, 0.5)

        lightFront.rotation.x = (45 * Math.PI) / 180
        lightFront.rotation.z = (-45 * Math.PI) / 180
        lightFront.position.set(5, 5, 5)
        lightFront.castShadow = true
        lightFront.shadow.mapSize.width = 6000
        lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width
        lightFront.penumbra = 0.1

        lightBack.position.set(0, 6, 0)

        smoke.position.y = 2

        scene.add(ambientLight)
        city.add(lightFront)
        scene.add(lightBack)
        scene.add(city)
        city.add(smoke)
        city.add(town)

        //--------------------------------------------------- GRID
        const gridHelper = new THREE.GridHelper(60, 120, 0xff0000, 0x000000)
        city.add(gridHelper);

        //--------------------------------------------------- Cars
        const createCars = (cScale = 2, cPos = 20, cColor = 0xffff00) => {
            const cMat = new THREE.MeshToonMaterial({ color: cColor, side: THREE.DoubleSide })
            const cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40);
            const cElem = new THREE.Mesh(cGeo, cMat);
            const cAmp = 3

            if (createCarPos) {
                createCarPos = false
                cElem.position.x = -cPos
                cElem.position.z = mathRandom(cAmp)
                TweenMax.to(cElem.position, 3, {
                    x: cPos,
                    repeat: -1,
                    yoyo: true,
                    delay: mathRandom(3),
                });
            } else {
                createCarPos = true;
                cElem.position.x = mathRandom(cAmp)
                cElem.position.z = -cPos;
                cElem.rotation.y = Math.PI / 2;

                TweenMax.to(cElem.position, 5, {
                    z: cPos,
                    repeat: -1,
                    yoyo: true,
                    delay: mathRandom(3),
                    ease: Power1.easeInOut,
                });
            }

            cElem.receiveShadow = true;
            cElem.castShadow = true;
            cElem.position.y = Math.abs(mathRandom(5))
            city.add(cElem);
        };

        const generateLines = () => {
            for (let i = 0; i < 60; i++) {
                createCars(0.1, 20);
            }
        };

        const cameraSet = () => {
            createCars(0.1, 20, 0xffffff)
        };

        //--------------------------------------------------- Animate
        const animate = () => {
            requestAnimationFrame(animate);
            const time = Date.now() * 0.00005;

            city.rotation.y -= ((mouse.x * 8) - camera.rotation.y) * uSpeed;
            city.rotation.x -= (-(mouse.y * 2) - camera.rotation.x) * uSpeed;
            if (city.rotation.x < -0.05) city.rotation.x = -0.05
            else if (city.rotation.x > 1) city.rotation.x = 1

            smoke.rotation.y += 0.01
            smoke.rotation.x += 0.01

            camera.lookAt(city.position)
            renderer.render(scene, camera)
        };

        //--------------------------------------------------- Start
        generateLines()
        init()
        animate()

        return () => {
            // Clean up when unmounting
            window.removeEventListener("resize", onWindowResize)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("touchstart", onDocumentTouchStart)
            window.removeEventListener("touchmove", onDocumentTouchMove)
            containerRef.current.removeChild(renderer.domElement)
        };
    }, []);

    return (
        <div ref={containerRef} className="single3d-container">
            {/* Header  */}
            <div className="container-fluid fixed-top header disable-selection">
                <div className="row">
                    <div className="col"></div>
                    <div className="col-md-6">
                        <div className="row">
                            <div className="col">
                                <h1><strong>404</strong></h1>
                                <p className="small">– An error has occurred. –</p>
                            </div>
                        </div>
                    </div>
                    <div className="col"></div>
                </div>
            </div>

        </div>
    );
};
