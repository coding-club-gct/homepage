import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import GithubSlugger from "github-slugger"
import rehypeSlug from "rehype-slug"
import { getTimeString } from './src/lib/getTimeString'

async function getProfileFromUsername(username: string) {
    const profile = await fetch(`https://api.github.com/users/${username}`, {
        method: "GET",
        headers: {
            "Authorization": `token ${process.env.NEXT_PUBLIC_GITHUB_PAT!}`,
            "Content-Type": "application/json"
        },
        cache: "force-cache"
    }).then(res => res.json())
    return profile
}

export type GithubDataForBlog = {
    author: {
        name: string,
        blog: string,
        html_url: string,
        email: string,
        avatar_url: string
    }, committer: {
        name: string,
        avatar_url: string
        committed_date: string
    }
}

async function getGithubDataforBlog(pathname: string): Promise<GithubDataForBlog | undefined> {
    console.log(pathname)
    const filePathName = `src/blogs/${pathname}.mdx`
    console.log(filePathName)
    const apiUrl = `https://api.github.com/repos/coding-club-gct/blogs/commits?path=${filePathName}`
    const resp = await fetch(apiUrl, {
        method: "GET",
        headers: {
            "Authorization": `token ${process.env.NEXT_PUBLIC_GITHUB_PAT!}`,
            "X-GitHub-Api-Version": "2022-11-28"
        },
        cache: "force-cache"
    }).then(res => res.json())
    if (!resp.length) {
        console.log(resp)
        return undefined
    }
    const { author } = resp[0]
    const { committer } = resp[resp.length - 1]
    const { name, blog, html_url, email } = await getProfileFromUsername(author.login)
    const { name: committerName } = await getProfileFromUsername(committer.login)
    return {
        author: { name, blog, html_url, email, avatar_url: author.avatar_url },
        committer: { name: committerName, avatar_url: committer.avatar_url, committed_date: getTimeString(resp[resp.length - 1].commit.committer.date) }
    }
}

export const Blog = defineDocumentType(() => ({
    name: "Blog",
    contentType: "mdx",
    filePathPattern: "**/*.mdx",
    fields: {
        tags: {
            type: "list",
            of: {
                type: "string"
            },
        }, title: {
            type: "string",
            required: true
        }, coverImage: {
            type: "string",
            required: true
        }, hideAuthor: {
            type: "boolean"
        }
    },
    computedFields: {
        url: {
            type: 'string', resolve: (doc) => doc._raw.sourceFilePath.replace(/\.mdx$/, ""),
        },
        headings: {
            type: "json",
            resolve: async (doc) => {
                const regXHeader = /\n(?<flag>#{1,6})\s+(?<content>.+)/g;
                const slugger = new GithubSlugger()
                const headings = Array.from(doc.body.raw.matchAll(regXHeader)).map(
                    ({ groups }) => {
                        const content = groups?.content;
                        return {
                            text: content,
                            slug: content ? slugger.slug(content) : undefined
                        };
                    }
                );
                return headings;
            },
        },
        githubData: {
            type: "json",
            resolve: async (doc) => {
                const pathname = doc._raw.sourceFilePath.replace(/\.mdx$/, "")
                return await getGithubDataforBlog(pathname)
            }
        }
    }
}))

export default makeSource({
    contentDirPath: 'src/blogs', documentTypes: [Blog], mdx: {
        rehypePlugins: [rehypeSlug],
    },
})