import { useState } from 'react';

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns'

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import PostInfo from '../components/PostInfo';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

function convertPost(postResponse: any){
  return {
    uid: postResponse.uid,
    first_publication_date: postResponse.first_publication_date,
    data: {
      author: postResponse.data.author,
      subtitle: postResponse.data.subtitle,
      title: postResponse.data.title
    }
  }
}

export default function Home({postsPagination}: HomeProps) {
  const [loadMore, setLoadMore] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  function handleLoadMore(){
    fetch(loadMore).then(response => response.json()).then(data => {
      setLoadMore(data.next_page);

      const newPosts = data.results.map((post: any) => {
        return convertPost(post);
      });

      setPosts((prevPosts)=>{
        return [
          ...prevPosts,
          ...newPosts
        ]
      })
    })
  }

  

  return (
    <main className={`${commonStyles.wrapper} ${styles.container}`}>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <img src="/images/logo.svg" alt="logo" />
      {
        posts.map((result: Post) => (
          <Link key={result.uid} href={`/post/${result.uid}`}>
            <a className={styles.post}>
              <h1>{result.data.title}</h1>
              <p>{result.data.subtitle}</p>
              
              <PostInfo>
                <div>
                  <FiCalendar />
                  <time>{format(new Date(result.first_publication_date), "dd LLL yyyy").toLowerCase()}</time>
                </div>
                <div>
                  <FiUser />
                  <span>{result.data.author}</span>
                </div>
              </PostInfo>
            </a>
          </Link>
        ))
      }
      
      {
        loadMore && (
          <button 
            onClick={handleLoadMore}
            className={styles.loadButton}>
            Carregar mais posts
          </button>
        )
      }
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'post')
  ], {
    fetch: [
      'post.title',
      'post.subtitle',
      'post.author'
    ],
    pageSize: 1
  });

  const results:Post[] = postsResponse.results.map((post: any) => {
    return convertPost(post);
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    }
  }
};
