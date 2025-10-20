import Toast from 'react-native-toast-message';
import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';
import { generatePDFFile } from './pdfUtils';

export const handleDirectShare = async (event, fetchEventDetails) => {
  try {
    Toast.show({
      type: 'info',
      text1: 'Preparing PDF',
      text2: 'Please wait...',
    });

    const eventDetails = await fetchEventDetails(event.id);
    const pdfPath = await generatePDFFile(event, eventDetails);

    const exists = await RNFetchBlob.fs.exists(pdfPath);
    if (!exists) throw new Error('PDF file not found');

    const fileUrl = `file://${pdfPath.replace('file://', '')}`;
    const shareOptions = {
      title: `Quotation for ${event.name}`,
      url: fileUrl,
      type: 'application/pdf',
      message: `Quotation for ${event.name}`,
      failOnCancel: false,
    };

    await Share.open(shareOptions);
    Toast.show({ type: 'success', text1: 'Quotation shared successfully!' });
  } catch (error) {
    console.error('Share error:', error);
    Toast.show({
      type: 'error',
      text1: 'Failed to share PDF',
      text2: error.message || 'Please try again',
    });
  }
};
