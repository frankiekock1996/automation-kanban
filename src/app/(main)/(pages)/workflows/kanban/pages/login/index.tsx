import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import { getAuth } from '@clerk/nextjs/server';

export default function Home() {
    return (
        <Layout>
            <Head>
                <title>Kanban Board</title>
                <meta name="description" content="Task management web app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <main className="text-bold flex h-full flex-col items-center justify-center overflow-scroll px-4 text-center font-jakarta text-lg text-mid-grey dark:text-white">
                <p id="empty-board-msg" className="mb-8">
                    Create a new board or select an existing one to get started.
                </p>
            </main>
        </Layout>
    );
}

export async function getServerSideProps(context: any) {
    const { userId } = getAuth(context.req);

    if (!userId) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    return {
        props: { userId },
    };
}