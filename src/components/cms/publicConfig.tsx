import Testimonials from "@/components/landing/Testimonials";
import { cmsConfig } from "./config";

export const publicConfig: typeof cmsConfig = {
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
