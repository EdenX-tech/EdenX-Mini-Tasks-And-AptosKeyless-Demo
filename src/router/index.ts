import Vue from 'vue';
import VueRouter from 'vue-router';
import CallbackComponent from '@/components/CallbackComponent.vue';
import UserDashboard from '@/components/UserDashboard.vue';
import Tasks from "../components/Tasks.vue";

Vue.use(VueRouter);

const routes = [
    { path: '/', component: Tasks },
    { path: '/callback', component: CallbackComponent },
    { path: '/dashboard', component: UserDashboard },
    { path: '/tasks', component: Tasks },
];

const router = new VueRouter({
    mode: 'history',  // 使用 history 模式，避免在 URL 中出现 #
    routes
});

export default router;