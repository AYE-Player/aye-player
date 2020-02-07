import ytsr from "ytsr";

const searchYoutube = async (term: string): Promise<any> => {
  const filters = await ytsr.getFilters(term);
  const filter = filters.get("Type").find((o: any) => o.name === "Video");

  return ytsr(null, {
    limit: 1,
    nextpageRef: filter.ref
  });
};

export default searchYoutube;
