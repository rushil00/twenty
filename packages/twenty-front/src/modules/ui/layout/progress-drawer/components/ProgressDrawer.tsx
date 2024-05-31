// /* eslint-disable @nx/workspace-no-state-useref */
// /* eslint-disable @nx/workspace-matching-state-variable */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimationControls, motion, useAnimation } from 'framer-motion';
import { useRecoilState } from 'recoil';

import { NumberOfRecordsState } from '@/selection-menu-new/states/NumberOfRecordsState';

export type ProgressBarProps = {
  fraction?: number; // New prop for fraction
  duration?: number;
  delay?: number;
  easing?: string;
  barHeight?: number;
  barColor?: string;
  autoStart?: boolean;
  className?: string;
};

export type StyledBarProps = {
  barHeight?: number;
  className?: string;
};

export type ProgressBarControls = AnimationControls & {
  start: () => Promise<any>;
  pause: () => Promise<any>;
};

const StyledBar = styled.div<StyledBarProps>`
  height: ${({ barHeight }) => barHeight}px;
  overflow: hidden;
  width: 100%;
`;

const StyledBarFilling = styled(motion.div)`
  height: 100%;
  width: 100%;
`;

export const ProgressBar = forwardRef<ProgressBarControls, ProgressBarProps>(
  (
    {
      duration = 300000,
      delay = 0,
      easing = 'easeInOut',
      barHeight = 24,
      barColor,
      autoStart = true,
      className,
    },
    ref,
  ) => {
    const theme = useTheme();
    const controls = useAnimation();
    const startTimestamp = useRef<number>(0);
    const remainingTime = useRef<number>(duration);
    const [recordNum, setRecordNum] = useRecoilState(NumberOfRecordsState);
    const start = useCallback(async () => {
      startTimestamp.current = Date.now();
      return controls.start({
        scaleX: recordNum, // Use fraction completed as scaleX value
        transition: {
          duration: remainingTime.current / 1000,
          delay: delay / 1000,
          ease: easing,
        },
      });
    }, [controls, delay, easing, recordNum]);

    useImperativeHandle(ref, () => ({
      ...controls,
      start: async () => {
        return start();
      },
      pause: async () => {
        const elapsed = Date.now() - startTimestamp.current;
        remainingTime.current = remainingTime.current - elapsed;
        return controls.stop();
      },
    }));

    useEffect(() => {
      if (autoStart) {
        start();
      }
    }, [controls, delay, duration, easing, autoStart, start]);

    // useEffect(() => {
    //   setRecordNum(fraction); // Update fraction completed when prop changes
    // }, [fraction]);

    return (
      <StyledBar className={className} barHeight={barHeight}>
        <StyledBarFilling
          style={{
            originX: 0,
            backgroundColor: barColor ?? theme.color.gray80,
          }}
          initial={{ scaleX: 0 }}
          animate={controls}
          exit={{ scaleX: 1 }}
        />
      </StyledBar>
    );
  },
);
