"use client";

import Comments from './Comments';

export default function LabComments({ pageId }: { pageId?: string }) {
  return <Comments path={pageId} />;
}
