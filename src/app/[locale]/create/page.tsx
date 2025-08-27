import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CreateClient from './CreateClient';


interface PageProps {
  params: {
    locale: string;
  };
}

export default async function CreatePage({ params: { locale } }: PageProps) {
  const t = await getTranslations({ locale });

  // Extract only static translation messages (no interpolation needed)
  const translations = {
    title: t('create.title'),
    subtitle: t('create.subtitle'),
    loginRequired: t('create.loginRequired'),
    credits: {
      getCredits: t('create.credits.getCredits')
    },
    prompt: {
      label: t('create.prompt.label'),
      placeholder: t('create.prompt.placeholder')
    },
    image: {
      label: t('create.image.label'),
      dragDrop: t('create.image.dragDrop'),
      fileTypes: t('create.image.fileTypes'),
      uploading: t('create.image.uploading'),
      uploadSuccess: t('create.image.uploadSuccess'),
      uploadDescription: t('create.image.uploadDescription'),
      remove: t('create.image.remove'),
      loginToUpload: t('create.image.loginToUpload')
    },
    provider: {
      label: t('create.provider.label'),
      veo3: {
        title: t('create.provider.veo3.title'),
        subtitle: t('create.provider.veo3.subtitle')
      },
      runway: {
        title: t('create.provider.runway.title'),
        subtitle: t('create.provider.runway.subtitle')
      }
    },
    model: {
      label: t('create.model.label'),
      veo3Fast: {
        title: t('create.model.veo3Fast.title'),
        subtitle: t('create.model.veo3Fast.subtitle')
      },
      veo3Standard: {
        title: t('create.model.veo3Standard.title'),
        subtitle: t('create.model.veo3Standard.subtitle')
      }
    },
    duration: {
      label: t('create.duration.label'),
      '5seconds': {
        title: t('create.duration.5seconds.title'),
        subtitle: t('create.duration.5seconds.subtitle')
      },
      '8seconds': {
        title: t('create.duration.8seconds.title'),
        subtitle: t('create.duration.8seconds.subtitle')
      }
    },
    quality: {
      label: t('create.quality.label'),
      '720p': {
        title: t('create.quality.720p.title'),
        subtitle: t('create.quality.720p.subtitle')
      },
      '1080p': {
        title: t('create.quality.1080p.title'),
        subtitle: t('create.quality.1080p.subtitle'),
        unavailable: t('create.quality.1080p.unavailable')
      }
    },
    aspectRatio: {
      label: t('create.aspectRatio.label'),
      ratios: {
        '16:9': t('create.aspectRatio.ratios.16:9'),
        '4:3': t('create.aspectRatio.ratios.4:3'),
        '1:1': t('create.aspectRatio.ratios.1:1'),
        '3:4': t('create.aspectRatio.ratios.3:4'),
        '9:16': t('create.aspectRatio.ratios.9:16')
      }
    },
    watermark: {
      label: t('create.watermark.label'),
      placeholder: t('create.watermark.placeholder'),
      description: t('create.watermark.description')
    },
    generate: {
      button: t('create.generate.button'),
      generating: t('create.generate.generating'),
      loginToGenerate: t('create.generate.loginToGenerate')
    },
    preview: {
      title: t('create.preview.title'),
      description: t('create.preview.description'),
      templatePreview: t('create.preview.templatePreview'),
      demo: t('create.preview.demo')
    },
    progress: {
      creating: t('create.progress.creating'),
      starting: t('create.progress.starting'),
      queued: t('create.progress.queued'),
      ready: t('create.progress.ready')
    },
    result: {
      title: t('create.result.title'),
      withImage: t('create.result.withImage')
    },
    faq: {
      title: t('create.faq.title'),
      failedGeneration: {
        title: t('create.faq.failedGeneration.title'),
        answer: t('create.faq.failedGeneration.answer')
      },
      generationTime: {
        title: t('create.faq.generationTime.title'),
        answer: t('create.faq.generationTime.answer')
      },
      freePlan: {
        title: t('create.faq.freePlan.title'),
        answer: t('create.faq.freePlan.answer')
      },
      betterResults: {
        title: t('create.faq.betterResults.title'),
        answer: t('create.faq.betterResults.answer')
      },
      commercialUse: {
        title: t('create.faq.commercialUse.title'),
        answer: t('create.faq.commercialUse.answer')
      },
      howToDownload: {
        title: t('create.faq.howToDownload.title'),
        answer: t('create.faq.howToDownload.answer')
      }
    }
  };

  return (
    <div className="min-h-screen hero-bg">
      <Navigation />
      <CreateClient translations={translations} />
      <Footer />
    </div>
  );
}