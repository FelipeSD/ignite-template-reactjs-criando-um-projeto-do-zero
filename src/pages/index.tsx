import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import { format } from 'date-fns'

import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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
    first_publication_date: format(new Date(postResponse.first_publication_date), "dd LLL yyyy"),
    data: {
      author: postResponse.data.author,
      subtitle: postResponse.data.subtitle,
      title: postResponse.data.title
    }
  }
}

export default function Home({postsPagination}: HomeProps) {
  const [loadMore, setLoadMore] = useState<boolean>(() => postsPagination.next_page ? true : false);
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);

  function handleLoadMore(){
    fetch(postsPagination.next_page).then(response => response.json()).then(data => {
      setLoadMore(data.next_page ? true : false);

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
      <img src="/images/logo.svg" alt="logo" />
      {
        posts.map((result: Post) => (
          <Link key={result.uid} href={`/post/${result.uid}`}>
            <a className={styles.post}>
              <h1>{result.data.title}</h1>
              <p>{result.data.subtitle}</p>
              
              <div className={styles.postInfo}>
                <div>
                  <FiCalendar />
                  <time>{result.first_publication_date}</time>
                </div>
                <div>
                  <FiUser />
                  <span>{result.data.author}</span>
                </div>
              </div>
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

  // TODO
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results
      }
    }
  }
};
