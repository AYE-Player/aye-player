import ytsr from "ytsr";

const searchYoutube = async (term: string): Promise<any> => {
  const filters = await ytsr.getFilters(term);
  const filter = filters.get("Type").get("Video");

  return ytsr(filter.url, { pages: 1});
};

export default searchYoutube;
