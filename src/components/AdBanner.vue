<template>
  <div class="ad-banner" :style="{ width: sizeWidth, height: sizeHeight }">
    <!-- Conteúdo do anúncio -->
    <div class="ad-content">
      <p>Anúncio - Espaço reservado para publicidade</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: '300x250'
  }
});

const sizeParts = props.size.split('x');
const sizeWidth = sizeParts[0] + 'px';
const sizeHeight = sizeParts[1] + 'px';
</script>

<style scoped>
.ad-banner {
  background: linear-gradient(45deg, var(--color1), var(--color2));
  border: 2px dashed var(--color3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto;
  display: none;
}

.ad-content {
  text-align: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.ad-content p {
  margin: 0;
  padding: 1rem;
}

/* Seu CSS extra pode ficar em outro arquivo ou aqui abaixo */

.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.details {
  flex: 1;
  margin-left: 1rem;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;

  color: var(--color-text);
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
