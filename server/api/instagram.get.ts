export default defineEventHandler(async (event) => {
  const token = process.env.INSTAGRAM_TOKEN
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID

  if (!token || !accountId) {
    return { posts: [], error: 'Instagram not configured' }
  }

  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp'
    const url = `https://graph.facebook.com/v18.0/${accountId}/media?fields=${fields}&limit=9&access_token=${token}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.error) {
      return { posts: [], error: data.error.message }
    }

    return {
      posts: (data.data || []).map((post: any) => ({
        id: post.id,
        caption: post.caption?.slice(0, 120) || '',
        type: post.media_type,
        url: post.media_url,
        permalink: post.permalink,
        thumbnail: post.thumbnail_url || post.media_url,
        date: post.timestamp,
      })),
    }
  } catch (e: any) {
    return { posts: [], error: e.message }
  }
})
