<script lang="ts">
    let dialog: HTMLDialogElement;
    let container: HTMLDivElement;
    let closing = false;


    function keyDown(e: KeyboardEvent) {
        if (e.key === 'Escape' && dialog.open) {
            e.preventDefault();
            closeModal();
        }
    }
    
    function handleClick(e: MouseEvent) {
        const isInContainer = container.contains(e.target as HTMLElement);
        const isContainer = e.target === container;

        console.log(isInContainer, isContainer);

        if (!isInContainer && !isContainer) {
            closeModal();
        }
    }

    export function openModal() {
        dialog.showModal();
        window.addEventListener("keydown", keyDown);
    }

    export function closeModal() {
        if (!dialog.open || dialog.classList.contains("closing")) return;

        document.documentElement.classList.remove("overflow-hidden");

        closing = true;
        
        dialog.addEventListener('animationend', () => {
            closing = false;
            dialog.close();
            // last to prevent Escape spam bug
            window.removeEventListener("keydown", keyDown);
        }, { once: true });
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} class:closing on:click={handleClick}>
    <div class="container" bind:this={container}>
        <hgroup>
            <h2>Cube Info</h2>
            <button on:click={closeModal}>&times;</button>
        </hgroup>
        <div class="about-body">
            <h3>Cube Notation</h3>

            <p>The Rubik's Cube, like any good cube, has 6 faces. They're called the Front, Right, Up, Down, Left, and Back faces. The letters <mark>F</mark>, <mark>R</mark>, <mark>U</mark>, <mark>D</mark>, <mark>L</mark>, and <mark>B</mark> denote those faces.</p>

            <p>The primary turns to be concerned with are the clockwise, counterclockwise, or double turns. A clockwise turn is denoted using just the letter, so a clockwise turn of the Front face would be <mark>F</mark>. A counterclockwise turn is represented by adding a single quote after the letter, so a counter clockwise turn of the Front face would be <mark>F'</mark>. A double turn of the front face is denoted by <mark>F2</mark>.</p>

            <p>An entire cube rotation is denoted with <mark>x</mark>, <mark>y</mark>, or <mark>z</mark>, each representing the axis the cube was rotated on. The same counter clockwise and double turn notation rules apply.</p>

            <p>The middle layers of the cube can be rotated too. They are denoted with <mark>M</mark>, <mark>E</mark>, and <mark>S</mark>. I think those mean "Middle", "Equator", and "Slice". To understand what "middle layers" are, it's probably easier to just go press the buttons to turn the layers than it would be to explain it. The same counter clockwise and double turn notation rules apply.</p>

            <p>Two layers can be turned at once with "wide" turns. These can be denoted in two ways: a lowercase letter like <mark>f</mark> or by adding a "w" after the letter like <mark>Fw</mark>. I like the second notation since it's a bit more obvious. The same counter clockwise and double turn notation rules apply.</p>

            <h3>Controls</h3>

            <p>You can pan the cube with right click and zoom in and out with the scroll wheel. No rotating the cube with the mouse since that makes it really ambiguous which face is the "Front" or the "Right" (or it's at least too hard for me to figure out with my limited 3D knowledge).</p>

            <p>The "Undo All" button just plays your move history back to you. It is very naive, but I kinda like it.</p>

            <p>The wide moves are hidden on smaller screens. Who really needs them anyway.</p>


            
            <h3>How it was made</h3>

            <p>Interactive Rubik's Cube made with <a href="https://threejs.org/">Three.js</a> and <a href="https://kit.svelte.dev/">SvelteKit</a>. Here is the <a href="https://github.com/samstorment/cube">GitHub Repo</a>.</p>


            <h3>Cube Resources</h3>

            <p><a href="https://jperm.net/3x3/moves">Rubik's Cube Move Notation</a> by <a href="https://www.youtube.com/@JPerm">Jperm</a>. He has a YouTube channel with tons of great Rubik's Cube videos and his <a href="https://www.youtube.com/watch?v=7Ron6MN45LY">beginner tutorial video</a> is the modern go-to for anyone learning.</p>

            <p>The <a href="https://www.youtube.com/watch?v=HsQIoPyfQzM">OG "How to solve a Rubik's Cube" video</a> by Dan Brown. This is how I learned in probably 2012 or 2013.</p>


            <h3>Cubing YouTube Channels</h3>

            <p>These are some channels I would watch when my Rubik's Cube love was at its peak. Sad to see many of them haven't been active in a while.</p>

            <div class="youtubers">
                <a href="https://www.youtube.com/@crazybadcuber/videos">CrazyBadCuber</a>
                <a href="https://www.youtube.com/@MeMyselfAndPi/videos">MeMyselfAndPi</a>
                <a href="https://www.youtube.com/@JRCuber/videos">JRCuber</a>
                <a href="https://www.youtube.com/@badmephisto/videos">badmephisto</a>
                <a href="https://www.youtube.com/@TonyFisherPuzzles/videos">Tony Fisher</a>
                <a href="https://www.youtube.com/@fzemdegs">Feliks Zemdegs</a>
                <a href="https://www.youtube.com/@redkb/channels">RedKB</a>
                <a href="https://www.youtube.com/@corenpuzzle/videos">corenpuzzle</a>
            </div>


            <h3>More Cube Info</h3>

            <p>A double turn can be clockwise or counterclockwise; either way the cube will be in the same state. Three clockwise turns will leave the cube in the same state as if you did one counterclockwise turn. The same is true for three counterclockwise turns. Four turns of a face will leave the cube in the same state as if you did zero turns. Because of this, there is no notation like <mark>F3</mark> or <mark>F4</mark>.</p>
    
        </div>
    </div>
</dialog>

<style>
        
    a {
        color: yellow;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    hgroup {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    h2 {
        font-size: 1.75rem;
    }

    button {
        cursor: pointer;
    }

    hgroup button {
        background-color: transparent;
        color: white;
        border: none;
        font-size: 2rem;
        line-height: 0;
    }

    hgroup button:hover {
        text-shadow: 0 0 1rem red;
        color: hsl(0, 70%, 50%);
    }

    .about-body p {
        margin-bottom: .75rem;
    }

    .about-body > *:last-child {
        margin-bottom: 0;
    }

    h3 {
        margin-bottom: 1rem;
        margin-top: 1.5rem;
        border-bottom: 1px solid hsl(120, 100%, 25%, .5);
        padding-bottom: .5rem;
    }

    .youtubers {
        display: flex;
        flex-wrap: wrap;
        gap: .5rem;
    }

    .youtubers a {
        border: 1px solid yellow;
        padding: .25rem .5rem;
        border-radius: .25rem;
        text-decoration: none;
        transition: scale ease-in-out 200ms;
    }

    .youtubers a:hover {
        box-shadow: 0 0 .25rem 0 yellow;
        text-shadow: 0 0 6px yellow;
    }

    mark {
        padding: 2px 4px;
        border-radius: .25rem;
    }

    mark:nth-child(1n) {
        background-color: green;
        color: white;
    }

    mark:nth-child(2n) {
        background-color: red;
        color: white;
    }

    mark:nth-child(3n) {
        background-color: white;
        color: black;
    }

    mark:nth-child(4n) {
        background-color: yellow;
        color: black;
    }

    mark:nth-child(5n) {
        background-color: orange;
        color: black;
    }

    mark:nth-child(6n) {
        background-color: blue;
        color: white;
    }

    .container {
        padding: 1rem;

    }

    dialog {
        max-width: min(800px, calc(100vw - 2rem));
        margin: auto;
        border-radius: .25rem;
        background-color: hsl(0, 0%, 0%, .8);
        backdrop-filter: blur(10px);
        color: white;
        border: none;
        box-shadow: 0 0 .5rem 0 green;
        transition: translate ease-in-out 1000ms;
    }


    dialog::backdrop {
        background-color: hsl(0, 0%, 0%, .8);
        backdrop-filter: blur(5px);
        padding: 5rem;
    }

    dialog[open] {
        animation-name: open-settings;
        animation-duration: 250ms;
        animation-timing-function: ease;
    }

    dialog.closing {
        animation-name: close-settings;
        animation-duration: 250ms;
        animation-timing-function: ease;
        pointer-events: none;
    }

    dialog[open]::backdrop {
        animation-name: open-backdrop;
        animation-duration: 250ms;
        animation-timing-function: ease;
    }

    dialog.closing::backdrop {
        animation-name: close-backdrop;
        animation-duration: 250ms;
        animation-timing-function: ease;
    }

    @keyframes open-settings {
        from {
            transform: translateY(110vh);
        }
    }

    @keyframes close-settings {
        to {
            transform: translateY(100vh);
        }
    }

    
    @keyframes open-backdrop {
        from {
            opacity: 0;
        }

        to {
            opacity: 1;
        }
    }

    @keyframes close-backdrop {
        to {
            opacity: 0;
        }
    }
</style>