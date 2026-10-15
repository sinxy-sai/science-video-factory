import {Config} from '@remotion/cli/config';

// Keep generated Remotion assets separate from source content and renders.
Config.setPublicDir('static');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
