# OSG Display

OSG Display is a static website which is used to view analytical information about jobs ran on [OSPool](https://osg-htc.org/). The main deployment is at [display.osg-htc.org](https://display.osg-htc.org).

## Project Structure

The site is built every day in order to provide fallback data, in case GRACC is down and live statistics can't be used for the client.

The main file where [GRACC](https://gracc.opensciencegrid.org/) (the OSG Elasticsearch instance) is queried is at `src/util/gracc.ts`.

The files `src/components/ChartContainer.tsx` and `src/components/Sidebar/Sidebar.tsx`, which are server-side components, query this data on build, and pass them onto child client-side components.

If the connection to GRACC is successful, the client-side components will re-query the data on mount as well as every 3 minutes using [SWR](https://swr.vercel.app/).

## Local Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhoast:3000/osgdisplay](http://localhost:3000/osg-display) with your browser to see the result.

Depending on your deployment environment, you may need to change the `next.config.ts`'s `assetPath` and `basePath`. These are set by default to `/osg-display` to accomodate for my Github Pages.