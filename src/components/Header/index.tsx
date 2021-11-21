import Link from 'next/dist/client/link';
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={`${commonStyles.wrapper} ${styles.header}`}>
      <Link href="/">
        <a>
          <img src="/images/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
