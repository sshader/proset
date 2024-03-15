import { action } from "./_generated/server";
import { v } from "convex/values";

export const doSomething = action({
  args: { searchTerm: v.string() },
  handler: async(_, { searchTerm }) => {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[page]=1&request[per_page]=100&request[search]=${encodedSearchTerm}`;

    const response = await fetch(url);
    const data = await response.text();
    console.log(data)

    const response2 = await fetch(ur)

    if (!response.ok) {
      throw new Error(`WP API call error: ${response.status} ${JSON.stringify(data)}`);
    }
    // console.log(JSON.parse(data))

    return data;
  },
});