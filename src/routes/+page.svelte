<script lang="ts">
    import * as T from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import { intersection, union } from '$lib/set';
	import { run } from '$lib/util';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';

    let lastMove: string = '-';
    let modal: Modal;
    let turnSpeed = 5;
    let initialSize = 9;
    let cubieScale = 1;
    let maxSize = 10;

    type Cubie = ReturnType<typeof createCubie>;

    const cubies: Array<Cubie> = [];

    const faces = ['R', 'F', 'L', 'B', 'U', 'D'] as const;

    const turns = [ 
        ...faces,
        `R'`, `F'`, `L'`, `B'`, `U'`, `D'`,
        'R2', 'F2', 'L2', 'B2', 'U2', 'D2',
        'x', 'y', 'z', `x'`, `y'`, `z'`,
        'M', 'E', 'S', `M'`, `E'`, `S'`,
        'x2', 'y2', 'z2', `M2`, `E2`, `S2`,
        'f', 'r', 'u', 'd', 'l', 'b',
        `f'`, `r'`, `u'`, `d'`, `l'`, `b'`,
        'f2', 'r2', 'u2', 'd2', 'l2', 'b2',
    ] as const;

    type Face = typeof faces[number];
    type Turn = typeof turns[number];

    $: for (let c of cubies) {
        c.scale = cubieScale;
    }

    function createCubie(x: number, y: number, z: number) {

        let gap = maxSize - initialSize;

        const geometry = new T.BoxGeometry(maxSize - gap, maxSize - gap, maxSize - gap).toNonIndexed();

        const material = new T.MeshBasicMaterial({
            vertexColors: true
        });

        const mesh = new T.Mesh(geometry, material);

        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        return { 
            geometry, 
            material, 
            mesh,
            set scale(value: number) {
                mesh.scale.set(value, value, value);
            }
        }
    }
    
    function createControls(camera: T.PerspectiveCamera, canvas: HTMLCanvasElement) {
        const controls = new OrbitControls(camera, canvas);
        
        controls.enableDamping = true;
        controls.enableRotate = false;

        return controls;
    }


    onMount(() => {

        let width = window.innerWidth;
        let height = window.innerHeight;

        const FOV = 50;
        const ASPECT = width / height;
        // things closer than NEAR and further than FAR aren't rendered 
        const NEAR = 0.1;
        const FAR = 1000;

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
        const renderer = new T.WebGLRenderer({
            antialias: true
        });

        renderer.setSize(width, height);

        window.addEventListener('resize', e => {
            width = window.innerWidth;
            height = window.innerHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        });

        let dragging = false;
        let startX = 0, startY = 0;

        renderer.domElement.addEventListener('pointerdown', e => {
            if (e.button !== 0) return;
            dragging = true;
            startX = e.x;
            startY = e.y;
            renderer.domElement.style.touchAction = 'none';
        })

        renderer.domElement.addEventListener('pointermove', e => {

            if (!dragging) return;
            if (queue.length > 2) return;

            let threshold = 40;

            let changeX = e.x - startX;
            let changeY = e.y - startY;
            let absX = Math.abs(changeX);
            let absY = Math.abs(changeY);


            if (absX > absY) {
                if (changeX > threshold) queue.push("y'");
                else if (changeX < -threshold) queue.push("y");
            } else {
                if (changeY > threshold) queue.push("x'");
                else if (changeY < -threshold) queue.push("x");
            }

            if (absX > threshold || absY > threshold) {
                return dragging = false;
            }
        })

        renderer.domElement.addEventListener('pointerup', e => {
            dragging = false;
            renderer.domElement.style.touchAction = 'none';
        })

        renderer.domElement.addEventListener('touchstart', e => e.preventDefault)

        document.querySelector("#cube-page")?.appendChild(renderer.domElement);


        const controls = createControls(camera, renderer.domElement);


        let coords = [ maxSize, 0, -maxSize ];

        for (let y of coords) {
            for (let z of coords) {
                for (let x of coords) {
                    // don't add the core cubie
                    // if (x === 0 && y === 0 && z === 0) continue; 
                    
                    cubies.push(createCubie(x, y, z));
                }
            }
        }

        const right   = () => new Set([...cubies.filter(c => c.mesh.position.x === maxSize)]);
        const up      = () => new Set([...cubies.filter(c => c.mesh.position.y === maxSize).reverse()]);
        const front   = () => new Set([...cubies.filter(c => c.mesh.position.z === maxSize)]);
        const left    = () => new Set([...cubies.filter(c => c.mesh.position.x === -maxSize)]);
        const down    = () => new Set([...cubies.filter(c => c.mesh.position.y === -maxSize)]);
        const back    = () => new Set([...cubies.filter(c => c.mesh.position.z === -maxSize)]);
        const middle  = () => new Set([...cubies.filter(c => c.mesh.position.x === 0)]);
        const equator = () => new Set([...cubies.filter(c => c.mesh.position.y === 0)]);
        const slice   = () => new Set([...cubies.filter(c => c.mesh.position.z === 0)]);
        const centers = () => new Set([...cubies.filter(c => Math.abs(c.mesh.position.x) + Math.abs(c.mesh.position.y) + Math.abs(c.mesh.position.z) === maxSize)]);


        const start = cubies.map(saveState);

        function saveState(c: Cubie) {
            return {
                rotation:  {
                    x: c.mesh.rotation.x,
                    y: c.mesh.rotation.y,
                    z: c.mesh.rotation.z
                },
                position: {
                    x: c.mesh.position.x,
                    y: c.mesh.position.y,
                    z: c.mesh.position.z
                }
            }
        }

        function colorRubiks() {
            right().forEach(c => colorSide(c, Side.Right, 0xff0000));
            up().forEach(c => colorSide(c, Side.Up, 0xffffff));
            front().forEach(c => colorSide(c, Side.Front, 0x00ff00));
            left().forEach(c => colorSide(c, Side.Left, 0xffa500));
            down().forEach(c => colorSide(c, Side.Down, 0xffff00));
            back().forEach(c => colorSide(c, Side.Back, 0x0000ff));
        }

        colorRubiks();


        // const white = intersection(up(), middle(), slice());

        // white.forEach(c => colorCubie(c, 0x00ff00));

        enum Side {
            Right, Left, Up, Down, Front, Back
        }

        function colorSide(cubie: Cubie, side: Side, hexColor: number) {
            const numPositions = cubie.geometry.getAttribute('position').count;
            const colors = [];
            const color = new T.Color();
            const numFaces = 6;

            for (let i = 0; i < numPositions / numFaces; i++) {

                const colorArray = cubie.geometry.getAttribute('color')?.array;

                if (i === side) color.setHex(hexColor);
                else if (colorArray) {
                    const startIndex = i * 6 * 3;
                    const endIndex = startIndex + 3;
                    const [ r, g, b ] = colorArray.slice(startIndex, endIndex);

                    color.setRGB(r, g, b);
                }
                else color.setHex(0x000000);

                for (let j = 0; j < numFaces; j++) {
                    colors.push(color.r, color.g, color.b);
                }
            }

            cubie.geometry.setAttribute('color', new T.Float32BufferAttribute(colors, 3));
        }

        function colorCubie(cubie: Cubie, color: { f?: number, r?: number, u?: number, d?: number, l?: number, b?: number } | number) {
            if (typeof color === 'number') {
                color = { 
                    f: color, r: color, u: color, d: color, l: color, b: color
                }
            }
            
            color.f && colorSide(cubie, Side.Front, color.f);
            color.r && colorSide(cubie, Side.Right, color.r);
            color.u && colorSide(cubie, Side.Up, color.u);
            color.d && colorSide(cubie, Side.Down, color.d);
            color.l && colorSide(cubie, Side.Left, color.l);
            color.b && colorSide(cubie, Side.Back, color.b);
        }

        const cube = new T.Object3D().add(...cubies.map(c => c.mesh));

        const light = new T.PointLight(0x404040, 1, .2);

        scene.add(light, cube);

        cube.rotateX(T.MathUtils.degToRad(30));
        cube.rotateY(T.MathUtils.degToRad(-30));
        
        if (width <= 650) {
            cube.position.y = 25;
            camera.position.z = 150;
        } else {   
            camera.position.z = 100;
        }

        let active: Turn | undefined = undefined;

        document.querySelectorAll('.buttons button').forEach(button => {
            const turn = button.getAttribute('data-turn') as Turn | null;

            
            if (!turn || !turns.includes(turn)) return;
            
            
            button.addEventListener('click', _ => {
                // remove this if check and you can enqueue a lot of turns by spamming/holding down enter
                if (queue.length <= 2) {
                    queue.push(turn);
                }
            });
        });

        // track the total rotation of this turn. Once this reaches 
        // Math.PI / 2 (a 90 degree face turn) we reset it to 0 and stop rotating
        let rotationSum = 0;
        let timeout = 0;

        // rotation speed can be negative to change rotation direction
        function rotate(turn: Turn, rotationSpeed = .2) {

            let face = run(() => {
                if (turn[0] === 'F') return front();  
                if (turn[0] === 'R') return right();  
                if (turn[0] === 'U') return up();  
                if (turn[0] === 'D') return down();  
                if (turn[0] === 'L') return left();  
                if (turn[0] === 'B') return back();
                if (turn[0] === 'M') return middle();
                if (turn[0] === 'S') return slice();
                if (turn[0] === 'E') return equator();
                if (turn[0] === 'f') return union(front(), slice());  
                if (turn[0] === 'r') return union(right(), middle());  
                if (turn[0] === 'u') return union(up(), equator());  
                if (turn[0] === 'd') return union(down(), equator());  
                if (turn[0] === 'l') return union(left(), middle());  
                if (turn[0] === 'b') return union(back(), slice());
                return cubies;
            });

            // rotation amount before adding 
            let currentRotation = rotationSum;

            rotationSum += rotationSpeed;

            if (rotationSum > Math.PI / 2) {
                rotationSpeed = Math.PI / 2 - currentRotation;
            }

            // flip the rotation direction since things do counter clockwise by default otherwise. oops!
            rotationSpeed *= -1;

            let t = turn[0].toLowerCase();

           
            if ( t === 'm' || t === 'e' || t === 'l' || t === 'd' || t === 'b') rotationSpeed *= -1;
            if (turn.endsWith(`'`)) rotationSpeed *= -1;
            if (turn.endsWith('2')) rotationSpeed *= 2;

            let axis = 
                t === 'r' || t === 'l' || t === 'x' || t === 'm' ? 'x' :
                t === 'f' || t === 'b' || t === 'z' || t === 's' ? 'z' :
                t === 'u' || t === 'd' || t === 'y' || t === 'e' ? 'y' : undefined;

            face.forEach(c => {
                const vec = new T.Vector3(
                    axis === "x" ? 1 : 0,
                    axis === "y" ? 1 : 0,
                    axis === "z" ? 1 : 0
                );

                // rotate the face
                c.mesh.position.applyAxisAngle(vec, rotationSpeed);
                // rotate the individual cubies
                c.mesh.rotateOnWorldAxis(vec, rotationSpeed);
            });

            if (rotationSum > Math.PI / 2) {
                active = undefined;
                rotationSum = 0; 

                face.forEach(c => {  
                    c.mesh.position.x = Math.round(c.mesh.position.x);
                    c.mesh.position.y = Math.round(c.mesh.position.y);
                    c.mesh.position.z = Math.round(c.mesh.position.z);
                });
            }

            lastMove = turn;

            // clearTimeout(timeout);

            // timeout = setTimeout(() => {
            //     document.querySelector('.move')!.innerHTML = '';
            // }, 1000)
        }


        let queue: Turn[] = [];
        let moveHistory: Turn[] = [];
        let solve: Turn[] = [];

        document.querySelector("#scramble")?.addEventListener('click', e => {
            const faceTurns = turns.filter(t => faces.includes(t.charAt(0) as Face));

            let i = 0;
            while (i++ < 25) {
                queue.push(faceTurns[Math.floor(Math.random() * faceTurns.length)]);
            }
        });

        document.querySelector("#solve")?.addEventListener('click', e => {

            // prevent running solve logic if we're already in the process of solving
            if (solve.length > 0) return; 

            // empty queue so game loop actually stops on solved state and doesn't go back into queued turns
            queue = [];

            solve = moveHistory.map(m => {
                if (m.includes('2')) return m;
                if (m.includes(`'`)) return m.replace(`'`, '');
                return m + `'`;
            }) as Turn[];

            moveHistory = [];
        });


        function* uperm() {
            let turns: Turn[] = [
                "R2", "U'", "R'", "U'", "R", "U", "R", "U", "R", "U'", "R"
            ]

            while (true) {
                for (const t of turns) {
                    yield t;
                }
            } 
        }

        const moves = uperm();

        function animate() {
            requestAnimationFrame(animate);

            renderer.render(scene, camera);

            if (!active) {
                if (solve.length > 0) {
                    active = solve.pop();

                    // if (solve.length === 0) {
                    // }
                } else {   
                    active = queue.shift();
                    active && moveHistory.push(active);
                }
            }

            active && rotate(active, turnSpeed * 2 * .02);

            controls.update();
        }

        animate();
    });
</script>

<svelte:head>
    <title>Rubik's Cube</title>
</svelte:head>


<div id="cube-page">
    <h1 class="sr-only">Interactive 3D Rubik's Cube</h1>

    <div class="buttons">
        <button data-turn="F" title="Front Clockwise">F</button>
        <button data-turn="R" title="Right Clockwise">R</button>
        <button data-turn="U" title="Up Clockwise">U</button>
        <button data-turn="D" title="Down Clockwise">D</button>
        <button data-turn="L" title="Left Clockwise">L</button>
        <button data-turn="B" title="Back Clockwise">B</button>

        <button data-turn="F'"  data-prime title="Front Counterclockwise">F'</button>
        <button data-turn="R'"  data-prime title="Right Counterclockwise">R'</button>
        <button data-turn="U'"  data-prime title="Up Counterclockwise">U'</button>
        <button data-turn="D'"  data-prime title="Down Counterclockwise">D'</button>
        <button data-turn="L'"  data-prime title="Left Counterclockwise">L'</button>
        <button data-turn="B'"  data-prime title="Back Counterclockwise">B'</button>

        <button data-turn="F2" data-double title="Front Twice">F2</button>
        <button data-turn="R2" data-double title="Right Twice">R2</button>
        <button data-turn="U2" data-double title="Up Twice">U2</button>
        <button data-turn="D2" data-double title="Down Twice">D2</button>
        <button data-turn="L2" data-double title="Left Twice">L2</button>
        <button data-turn="B2" data-double title="Back Twice">B2</button>

        <button data-turn="M" title="Middle Clockwise">M</button>
        <button data-turn="E" title="Equator Clockwise">E</button>
        <button data-turn="S" title="Slice Clockwise">S</button>
        <button data-turn="x" title="x Axis Rotation Clockwise">x</button>
        <button data-turn="y" title="y Axis Rotation Clockwise">y</button>
        <button data-turn="z" title="z Axis Rotation Clockwise">z</button>

        <button data-turn="M'" data-prime title="Middle Counterclockwise">M'</button>
        <button data-turn="E'" data-prime title="Equator Counterclockwise">E'</button>
        <button data-turn="S'" data-prime title="Slice Counterclockwise">S'</button>
        <button data-turn="x'" data-prime title="x Axis Rotation Counterclockwise">x'</button>
        <button data-turn="y'" data-prime title="y Axis Rotation Counterclockwise">y'</button>
        <button data-turn="z'" data-prime title="z Axis Rotation Counterclockwise">z'</button>

        <button data-turn="M2" data-double title="Middle Twice">M2</button>
        <button data-turn="E2" data-double title="Equator Twice">E2</button>
        <button data-turn="S2" data-double title="Slice Twice">S2</button>
        <button data-turn="x2" data-double title="x Axis Rotation twice">x2</button>
        <button data-turn="y2" data-double title="y Axis Rotation twice">y2</button>
        <button data-turn="z2" data-double title="z Axis Rotation twice">z2</button>

        <div class="wide">
            <button data-turn="f" title="Front Wide Clockwise">Fw</button>
            <button data-turn="r" title="Front Wide Clockwise">Rw</button>
            <button data-turn="u" title="Front Wide Clockwise">Uw</button>
            <button data-turn="d" title="Front Wide Clockwise">Dw</button>
            <button data-turn="l" title="Front Wide Clockwise">Lw</button>
            <button data-turn="b" title="Front Wide Clockwise">Bw</button>

            <button data-turn="f'" data-prime title="Front Wide Counterclockwise">Fw'</button>
            <button data-turn="r'" data-prime title="Front Wide Counterclockwise">Rw'</button>
            <button data-turn="u'" data-prime title="Front Wide Counterclockwise">Uw'</button>
            <button data-turn="d'" data-prime title="Front Wide Counterclockwise">Dw'</button>
            <button data-turn="l'" data-prime title="Front Wide Counterclockwise">Lw'</button>
            <button data-turn="b'" data-prime title="Front Wide Counterclockwise">Bw'</button>

            <button data-turn="f2" data-double title="Front Wide Twice">Fw2</button>
            <button data-turn="r2" data-double title="Front Wide Twice">Rw2</button>
            <button data-turn="u2" data-double title="Front Wide Twice">Uw2</button>
            <button data-turn="d2" data-double title="Front Wide Twice">Dw2</button>
            <button data-turn="l2" data-double title="Front Wide Twice">Lw2</button>
            <button data-turn="b2" data-double title="Front Wide Twice">Bw2</button>
        </div>

        <button id="scramble">Scramble</button>
        <button id="solve">Undo All</button>
    </div>

    <div class="interactions">
        <label for="turn-speed">Turn Speed</label>
        <input type="range" step="1" min="1" max="10" id="turn-speed" bind:value={turnSpeed}>
        <label for="cube-size">Cubie Scale</label>
        <input type="range" step=".1" min=".1" max="1" id="cubie-size" bind:value={cubieScale}>
        <button on:click={modal.openModal} class="cube-info">About</button>
    </div>

    <div class="move-info">
        <p>Last Move</p>
        <p class="move">{lastMove || "-"}</p>
    </div>

    
</div>

<Modal bind:this={modal} />


<style>
    #cube-page {
        min-height: 100dvh;
        background-color: black;
    }

    .buttons {
        padding: .5rem;
        position: absolute;
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: .25rem;
    }

    .buttons button {
        border: none;
        background-color: hsl(0, 0%, 100%);
        padding: .25rem .5rem;
        box-shadow: 0 0 .5rem 0 black;
        cursor: pointer;
        border-radius: .25rem;
    }

    button {
        cursor: pointer;
    }

    #scramble {
        grid-column: 1 / 4;
    }

    #solve {
        grid-column: 4 / -1;
    }

    .move-info {
        position: absolute;
        right: 1rem;
        top: 1rem;
        color: white;
        text-align: center;
    }

    .interactions {
        position: absolute;
        bottom: 0;
        padding: 1rem;
        color: white;
        display: flex;
        gap: 1rem;
        align-items: center;
        width: 100%;
    }

    .cube-info {
        background-color: transparent;
        color: limegreen;
        border: none;
        padding: 0;
        margin-left: auto;
    }

    .cube-info:hover {
        color: orange;
    }

    input[type='range'] {
        width: 100px;
        border-radius: none;
    }

    button[data-prime] {
        background-color: hsl(0, 0%, 66%);
    }

    button[data-double] {
        background-color: hsl(0, 0%, 33%);
        color: white;
    }

    
    .wide {
        display: contents;
    }
    

    @media (max-width: 650px) {
   
        .buttons {
            width: 100%;
            bottom: 0;
        }

        .buttons  button {
            padding: .5rem;
        }

        .interactions {
            bottom: auto;
            display: block;
        }

        .interactions :is(label, input) {
            display: none;
        }
        
    }

    @media (max-width: 1000px) {
        .wide {
            display: none;
        }
    }
</style>