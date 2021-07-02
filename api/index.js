const fetch = require("node-fetch");

const databaseId = process.env.NOTION_DATABASE_ID;
const apiKey = process.env.NOTION_API_KEY;

function parseResponse(response, data) {
  response.results.forEach((result) => {
    const { MainTags, Vegetarian, Type, Name } = result.properties;

    data.push({
      name: Name.title[0].text.content,
      vegetarian: Vegetarian.checkbox,
      tags: MainTags.multi_select.map((i) => i.name),
      type: Type.multi_select.map((i) => i.name),
    });
  });
}

async function recursivelyGetData(id, cursor, data) {
  const body = {
    filter: {
      property: "Name",
      text: {
        is_not_empty: true,
      },
    },
  };

  if (cursor) {
    body.start_cursor = cursor;
  }

  const response = await fetch(
    `https://api.notion.com/v1/databases/${id}/query`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2021-05-13",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "Name",
          text: {
            is_not_empty: true,
          },
        },
        start_cursor: cursor,
      }),
    }
  );

  const jsonData = await response.json();

  if (jsonData.has_more) {
    console.log(jsonData.next_cursor);
    await recursivelyGetData(databaseId, jsonData.next_cursor, data);
  }

  parseResponse(jsonData, data);
}

module.exports = (req, res) => {
  const data = [];
  recursivelyGetData(databaseId, undefined, data).then(() => {
    res.setHeader("Cache-Control", "s-maxage=86400");
    res.json(data);
    return res;
  });
};
