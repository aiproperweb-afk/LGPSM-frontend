import { Render } from "@puckeditor/core/rsc";
import Testimonials from "@/components/landing/Testimonials";
import { cmsConfig } from "./config";
import type { CmsPageData } from "./types";

const publicConfig: typeof cmsConfig = {
  ...cmsConfig,
  components: {
    ...cmsConfig.components,
    FaqLanding: {
      ...cmsConfig.components.FaqLanding,
      render: (props) => (
        <>
          <Testimonials />
          {cmsConfig.components.FaqLanding.render(props)}
        </>
      ),
    },
  },
};

export default function PublicPageRenderer({ data }: { data: CmsPageData }) {
  return <Render config={publicConfig} data={data} />;
}
