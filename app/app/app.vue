<template>
    <UApp>
        <NuxtLayout>
            <NuxtPage></NuxtPage>
        </NuxtLayout>
    </UApp>

    <NuxtLoadingIndicator></NuxtLoadingIndicator>
</template>

<style>
    html,
    body,
    #__nuxt {
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }

    #__nuxt {
        display: flex;
        flex-direction: column;
    }
</style>
