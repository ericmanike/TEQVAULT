import type { ComponentPropsWithoutRef, ForwardRefExoticComponent, RefAttributes } from 'react';

declare const RotatingText: ForwardRefExoticComponent<
  ComponentPropsWithoutRef<'span'> & {
    texts: string[];
    transition?: object;
    initial?: object;
    animate?: object;
    exit?: object;
    animatePresenceMode?: 'sync' | 'wait' | 'popLayout';
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: number | 'first' | 'last' | 'center' | 'random';
    loop?: boolean;
    auto?: boolean;
    splitBy?: 'characters' | 'words' | 'lines' | string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
  } & RefAttributes<unknown>
>;

export default RotatingText;
