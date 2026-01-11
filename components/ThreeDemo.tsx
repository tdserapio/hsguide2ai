"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeDemo() {
  useEffect(() => {
    const lrEl = document.getElementById("lr") as HTMLInputElement | null;
    const momEl = document.getElementById("mom") as HTMLInputElement | null;
    const lrVal = document.getElementById("lrVal");
    const momVal = document.getElementById("momVal");
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement | null;
    const playIcon = document.getElementById("playIcon");
    const stepBackBtn = document.getElementById(
      "stepBackBtn"
    ) as HTMLButtonElement | null;
    const stepFwdBtn = document.getElementById(
      "stepFwdBtn"
    ) as HTMLButtonElement | null;
    const progress = document.getElementById(
      "progress"
    ) as HTMLInputElement | null;
    const tNow = document.getElementById("tNow");
    const tEnd = document.getElementById("tEnd");
    const chipLoss = document.getElementById("chipLoss");
    const canvas = document.getElementById(
      "threeCanvas"
    ) as HTMLCanvasElement | null;

    if (
      !lrEl ||
      !momEl ||
      !lrVal ||
      !momVal ||
      !playBtn ||
      !playIcon ||
      !stepBackBtn ||
      !stepFwdBtn ||
      !progress ||
      !tNow ||
      !tEnd ||
      !chipLoss ||
      !canvas
    ) {
      return;
    }

    const fmtTime = (sec: number) => {
      const s = Math.max(0, Math.floor(sec));
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      return `${mm}:${ss}`;
    };

    const updateSliderLabels = () => {
      lrVal.textContent = Number(lrEl.value).toFixed(3);
      momVal.textContent = Number(momEl.value).toFixed(2);
    };
    updateSliderLabels();

    const rippleAmp = 0.6;
    const rippleFreq = 0.9;

    const loss = (x: number, z: number) => {
      const bowl = 0.08 * (x * x + z * z);
      const ripple = rippleAmp * Math.sin(rippleFreq * x) * Math.sin(rippleFreq * z);
      const ridge = 0.15 * Math.sin(1.8 * x);
      return bowl + ripple + ridge;
    };

    const grad = (x: number, z: number) => {
      const h = 1e-3;
      const fx1 = loss(x + h, z);
      const fx2 = loss(x - h, z);
      const fz1 = loss(x, z + h);
      const fz2 = loss(x, z - h);
      return { dx: (fx1 - fx2) / (2 * h), dz: (fz1 - fz2) / (2 * h) };
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
    camera.position.set(7, 7.2, 7);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 14;
    controls.target.set(0, 0.6, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(6, 9, 4);
    scene.add(dir);

    const grid = new THREE.GridHelper(12, 12, 0x8a8a8a, 0x9a9a9a);
    grid.position.y = -0.05;
    scene.add(grid);

    const landscapeGroup = new THREE.Group();
    scene.add(landscapeGroup);

    const makeLandscape = () => {
      while (landscapeGroup.children.length) {
        landscapeGroup.remove(landscapeGroup.children[0]);
      }

      const size = 10;
      const seg = 120;
      const geo = new THREE.PlaneGeometry(size, size, seg, seg);
      geo.rotateX(-Math.PI / 2);

      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i += 1) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, loss(x, z));
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: 0xf3f3f3,
        metalness: 0,
        roughness: 0.95,
        side: THREE.DoubleSide,
      });

      landscapeGroup.add(new THREE.Mesh(geo, mat));
      landscapeGroup.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry(geo),
          new THREE.LineBasicMaterial({
            color: 0xcfcfcf,
            transparent: true,
            opacity: 0.6,
          })
        )
      );
    };
    makeLandscape();

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.55,
        metalness: 0,
      })
    );
    scene.add(ball);

    const STEPS_PER_SEC = 60;
    const MAX_SECONDS = 20;
    const MAX_STEPS = Math.floor(MAX_SECONDS * STEPS_PER_SEC);
    const VEL_EPS = 2e-4;
    const GRAD_EPS = 3e-4;
    const STABLE_STEPS_REQUIRED = 80;

    let traj: { x: number; z: number; y: number; L: number }[] = [];
    let totalSteps = 0;
    let duration = 0;

    const computeTrajectory = () => {
      traj = [];
      let x = 3.4;
      let z = -2.8;
      let vx = 0;
      let vz = 0;

      const lr = parseFloat(lrEl.value);
      const mom = parseFloat(momEl.value);

      let stable = 0;

      for (let s = 0; s <= MAX_STEPS; s += 1) {
        const y = loss(x, z);
        const g = grad(x, z);
        traj.push({ x, z, y: y + 0.22, L: y });

        const gnorm = Math.hypot(g.dx, g.dz);
        const vnorm = Math.hypot(vx, vz);

        if (vnorm < VEL_EPS && gnorm < GRAD_EPS) {
          stable += 1;
        } else {
          stable = 0;
        }

        if (stable >= STABLE_STEPS_REQUIRED && s > 120) {
          break;
        }

        vx = mom * vx - lr * g.dx;
        vz = mom * vz - lr * g.dz;

        x += vx;
        z += vz;

        const clamp = 4.8;
        x = Math.max(-clamp, Math.min(clamp, x));
        z = Math.max(-clamp, Math.min(clamp, z));
      }

      totalSteps = Math.max(1, traj.length - 1);
      duration = totalSteps / STEPS_PER_SEC;

      progress.value = "0";
      tNow.textContent = fmtTime(0);
      tEnd.textContent = fmtTime(duration);
    };

    let playing = true;
    let stepIdx = 0;
    const PLAYBACK_RATE = 0.35;
    let stepAccumulator = 0;

    const setPlayIcon = () => {
      playIcon.innerHTML = playing
        ? '<path d="M7 5h4v14H7V5zm6 0h4v14h-4V5z" fill="currentColor"></path>'
        : '<path d="M8 5v14l11-7-11-7z" fill="currentColor"></path>';
    };
    setPlayIcon();

    const renderAtIndex = (i: number, updateProgress = true) => {
      stepIdx = Math.max(0, Math.min(totalSteps, i));
      const p = traj[stepIdx];
      if (!p) {
        return;
      }

      ball.position.set(p.x, p.y, p.z);
      chipLoss.textContent = `loss: ${p.L.toFixed(4)}`;

      const frac = totalSteps ? stepIdx / totalSteps : 0;
      tNow.textContent = fmtTime(frac * duration);
      if (updateProgress) {
        progress.value = String(frac);
      }
    };

    const setIndexFromFrac = (frac: number) => {
      const i = Math.round(Math.max(0, Math.min(1, frac)) * totalSteps);
      renderAtIndex(i, false);
    };

    const onParamsChanged = () => {
      updateSliderLabels();
      const frac = parseFloat(progress.value) || 0;
      computeTrajectory();
      setIndexFromFrac(frac);
    };

    const onProgressInput = () => {
      playing = false;
      setPlayIcon();
      setIndexFromFrac(parseFloat(progress.value));
    };

    const onPlayClick = () => {
      playing = !playing;
      setPlayIcon();
    };

    const stepBy = (delta: number) => {
      playing = false;
      setPlayIcon();
      renderAtIndex(stepIdx + delta, true);
    };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) {
        return;
      }
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const onResize = () => resize();

    const onStepBack = () => stepBy(-10);
    const onStepFwd = () => stepBy(10);

    ["input", "change"].forEach((evt) => {
      lrEl.addEventListener(evt, onParamsChanged);
      momEl.addEventListener(evt, onParamsChanged);
    });
    progress.addEventListener("input", onProgressInput);
    playBtn.addEventListener("click", onPlayClick);
    stepBackBtn.addEventListener("click", onStepBack);
    stepFwdBtn.addEventListener("click", onStepFwd);
    window.addEventListener("resize", onResize);

    let frameId = 0;
    let lastT = performance.now();

    const animate = (now: number) => {
      frameId = window.requestAnimationFrame(animate);
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      if (playing && totalSteps > 0) {
        stepAccumulator += dt * STEPS_PER_SEC * PLAYBACK_RATE;
        const adv = Math.floor(stepAccumulator);
        if (adv > 0) {
          stepAccumulator -= adv;
          const next = stepIdx + adv;
          if (next >= totalSteps) {
            renderAtIndex(totalSteps, true);
            playing = false;
            setPlayIcon();
          } else {
            renderAtIndex(next, true);
          }
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    requestAnimationFrame(() => {
      resize();
      computeTrajectory();
      renderAtIndex(0, true);
    });

    frameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      progress.removeEventListener("input", onProgressInput);
      playBtn.removeEventListener("click", onPlayClick);
      stepBackBtn.removeEventListener("click", onStepBack);
      stepFwdBtn.removeEventListener("click", onStepFwd);
      ["input", "change"].forEach((evt) => {
        lrEl.removeEventListener(evt, onParamsChanged);
        momEl.removeEventListener(evt, onParamsChanged);
      });
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return null;
}
