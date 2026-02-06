const BASE_URL = "https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets";

interface ApiResponse<T> {
  total_count: number;
  results: T[];
}

export async function fetchAllRecords<T>(
  datasetId: string,
  options: {
    where?: string;
    select?: string;
    limit?: number;
  } = {},
): Promise<T[]> {
  const limit = options.limit ?? 100;
  const allRecords: T[] = [];
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    if (options.where)
      params.set("where", options.where);
    if (options.select)
      params.set("select", options.select);

    const url = `${BASE_URL}/${datasetId}/records?${params}`;
    const response = await $fetch<ApiResponse<T>>(url);

    totalCount = response.total_count;
    allRecords.push(...response.results);
    offset += limit;
  }

  return allRecords;
}
