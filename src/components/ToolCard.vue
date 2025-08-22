<script setup>
defineProps({
  icon: String,
  title: String,
  description: String,
  to: String,
  badges: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="tool-card">
    <router-link :to="to" class="card-link">
      <div class="icon">{{ icon }}</div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      
      <!-- Badges -->
      <div v-if="badges && badges.length > 0" class="badges">
        <span
          v-for="badge in badges"
          :key="badge"
          class="badge"
        >
          {{ badge }}
        </span>
      </div>
    </router-link>
  </div>
</template>

<style scoped>
.tool-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.card-link {
  display: block;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
}

.icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.4;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.badge {
  background: #e7f3ff;
  color: #2a75ff;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge:nth-child(1) {
  background: #e6fff4;
  color: #2b8a3e;
}

.badge:nth-child(2) {
  background: #fff8e6;
  color: #e69900;
}

.badge:nth-child(3) {
  background: #f5e6ff;
  color: #8a2be2;
}
</style>
