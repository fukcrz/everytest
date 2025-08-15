import { BaseDialog } from "#components"
import type { BaseDialogProps } from "~/components/BaseDialog.vue"
import type { RouteLocationRaw } from "vue-router"

export function useFeedback() {
    const router = useRouter()
    const toast = useToast()
    const overlay = useOverlay()
    const { start: startLoading, finish: finishLoading } = useLoadingIndicator()

    const addToast = toast.add

    async function dialog(props: BaseDialogProps) {
        const dialog = overlay.create(BaseDialog, { destroyOnClose: true })
        return (await dialog.open(props).result) as boolean | undefined
    }

    function showFetchError(error: any, title: string = "操作失败") {
        if (error) {
            if (error.cause?.message == "Failed to fetch") {
                dialog({ title, message: "网络错误, 请检查网络连接" })
            } else {
                dialog({
                    title,
                    message:
                        error.data?.message ||
                        error.message ||
                        error.toString(),
                })
            }
        } else {
            dialog({ title, message: "未知错误" })
        }
    }

    function watchFetchError(errorRef: Ref<any>) {
        if (errorRef.value) showFetchError(errorRef.value)
        watch(errorRef, (error) => {
            if (error) showFetchError(error)
        })
    }

    async function operate<T>(promise: Promise<T>) {
        startLoading()
        return await promise
            .catch((e) => {
                showFetchError(e)
                throw e
            })
            .finally(finishLoading)
    }

    function goBack(rollback?: RouteLocationRaw) {
        if (history.length > 1) {
            router.back()
        } else if (rollback) {
            router.replace(rollback)
        }
    }

    return {
        toast,
        addToast,
        dialog,
        showFetchError,
        watchFetchError,
        operate,
        startLoading,
        finishLoading,
        goBack,
    }
}
