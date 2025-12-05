import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle
} from 'react-native';

interface ResponsiveImageProps extends Omit<ImageProps, 'source'> {
    source: { uri: string } | number | null;
    containerStyle?: StyleProp<ViewStyle>;
    showLoading?: boolean;
    width?: number | string;
    height?: number | string;
    aspectRatio?: number;
}

export function ResponsiveImage({ 
    source, 
    style, 
    containerStyle,
    showLoading = true,
    width = '100%',
    height,
    aspectRatio,
    ...props 
}: ResponsiveImageProps) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);
    const { width: windowWidth } = useWindowDimensions();
    
    const imageSource = React.useMemo(() => {
        if (!source) return null;
        if (typeof source === 'number') return source;
        if ('uri' in source && source.uri) return { uri: source.uri };
        return null;
    }, [source]);

    const imageStyle = React.useMemo<StyleProp<ImageStyle>>(() => {
        const baseStyle: ImageStyle = {
            width: typeof width === 'number' ? Math.min(width, windowWidth) : width,
        };

        if (height) {
            baseStyle.height = height;
        } else if (aspectRatio) {
            baseStyle.aspectRatio = aspectRatio;
        } else if (typeof width === 'number') {
            baseStyle.height = 'auto';
        }

        return [styles.image, baseStyle, style];
    }, [width, height, aspectRatio, windowWidth, style]);

    const handleLoadStart = () => {
        setIsLoading(true);
        setError(false);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError(true);
    };

    if (!imageSource) {
        return (
            <View style={[styles.container, containerStyle]}>
                <Text style={styles.errorText}>Imagem não disponível</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, containerStyle]}>
            <Image
                source={imageSource}
                style={imageStyle}
                resizeMode="contain"
                onLoadStart={handleLoadStart}
                onLoadEnd={handleLoadEnd}
                onError={handleError}
                fadeDuration={300}
                {...props}
            />
            
            {isLoading && showLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#0a7ea4" />
                </View>
            )}
            
            {error && (
                <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>Erro ao carregar a imagem</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1,
    },
    errorOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 200, 200, 0.7)',
        zIndex: 1,
    },
    errorText: {
        color: '#721c24',
        fontSize: 12,
        textAlign: 'center',
        padding: 8,
    },
});
