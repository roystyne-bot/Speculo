"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// A grid of dots that ripples with a sine wave over time — the classic
// "dotted surface" effect. Runs as a plain Three.js scene (no
// react-three-fiber needed) mounted into a container div, sized to fill
// its parent and sit behind the hero content.
export function DottedSurface() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 22, 30);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid of points in the XZ plane. Y is animated per-frame below.
    const rows = 60;
    const cols = 60;
    const spacing = 1.1;
    const positions = new Float32Array(rows * cols * 3);

    let i = 0;
    for (let x = 0; x < cols; x++) {
      for (let z = 0; z < rows; z++) {
        positions[i * 3] = (x - cols / 2) * spacing;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (z - rows / 2) * spacing;
        i++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x2fdd79, // spring green
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.008;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      let idx = 0;
      for (let x = 0; x < cols; x++) {
        for (let z = 0; z < rows; z++) {
          const wave =
            Math.sin(x * 0.3 + time) * 0.6 + Math.cos(z * 0.3 + time * 0.8) * 0.6;
          posAttr.setY(idx, wave);
          idx++;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)" }}
    />
  );
}