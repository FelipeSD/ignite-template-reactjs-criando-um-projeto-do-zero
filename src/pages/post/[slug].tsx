import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { format } from 'date-fns';

import Header from '../../components/Header';
import PostInfo from '../../components/PostInfo';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({post, readingTime}: PostProps) {
  const router = useRouter();

  if(router.isFallback){
    return <div>Carregando...</div>
  }

  return(
    <>
      <Head>
        <title>{post?.data.title} | spacetraveling</title>
      </Head>

      <Header />

      <img className={styles.banner} src={post?.data.banner.url} alt="banner" />

      <main className={`${commonStyles.wrapper} ${styles.container}`}>
        <h1 className={styles.heading}>{post?.data.title}</h1>

        <PostInfo>
          <div>
            <FiCalendar />
            <time>{format(new Date(post?.first_publication_date), "dd LLL yyyy").toLowerCase()}</time>
          </div>
          <div>
            <FiUser />
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock />
            <time>{readingTime} min</time>
          </div>
        </PostInfo>

        { post.data.content.map((content) => (
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}></div>
            </article>
          ))
        }
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: [
      'post.slug'
    ],
    orderings: '[post.last_publication_date]',
    pageSize: 1
  });

  const paths = posts.results.map((post) => {
    return { params: { slug: post.uid.toString() } }
  })

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  const {slug} = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID("post", String(slug), {});

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
      title: response.data.title
    }
  }

  // .length
  let numberWords = post.data.content.reduce((accumulator, content) => {
    let wordsHeading = content.heading.split(/[\s\n\t]/).length
    let wordsBody = RichText.asText(content.body).split(/[\s\n\t]/).length

    return accumulator + wordsHeading + wordsBody
  }, 0);

  let readingTime = Math.round(numberWords / 200)

  return {
    props: {
      post,
      readingTime
    },
    redirect: 60 * 60 * 24
  }
};
