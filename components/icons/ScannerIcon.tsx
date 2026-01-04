import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ScannerIconProps {
    size?: number;
    color?: string;
}

export const ScannerIcon: React.FC<ScannerIconProps> = ({
    size = 48,
    color = '#FFFFFF',
}) => {
    // El viewBox original es 960x960, escalamos proporcionalmente
    const scale = size / 48;

    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 -960 960 960"
            fill={color}
        >
            <Path d="M40-120v-182h60v122h122v60H40Zm697 0v-60h122v-122h60v182H737ZM153-231v-499h80v499h-80Zm121 0v-499h42v499h-42Zm122 0v-499h83v499h-83Zm125 0v-499h121v499H521Zm163 0v-499h42v499h-42Zm83 0v-499h38v499h-38ZM40-658v-182h182v60H100v122H40Zm819 0v-122H737v-60h182v182h-60Z" />
        </Svg>
    );
};

export default ScannerIcon;
