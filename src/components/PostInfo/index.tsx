import styles from './postInfo.module.scss';

export default function PostInfo({children}){
    return (
        <div className={styles.container}>
            {children}
        </div>
    )
}