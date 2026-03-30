import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

gsap.registerPlugin(
  useGSAP,
  SplitText,
  ScrollTrigger,
  CustomEase,
  Flip,
  Observer,
  ScrambleTextPlugin,
  MotionPathPlugin,
  DrawSVGPlugin,
  Draggable,
  InertiaPlugin,
);

// Register custom eases
CustomEase.create('vero.out', 'M0,0 C0.16,1 0.3,1 1,1');
CustomEase.create('vero.inOut', 'M0,0 C0.37,0 0.63,1 1,1');
CustomEase.create('vero.spring', 'M0,0 C0.34,1.56 0.64,1 1,1');

export { gsap, useGSAP, SplitText, ScrollTrigger, CustomEase, Flip, Observer, Draggable, InertiaPlugin };
