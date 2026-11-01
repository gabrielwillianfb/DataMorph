<?php

namespace App\Services\Mapping\Transformers;

class UnaccentTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        $transliterator = \Transliterator::create('NFD; [:Nonspacing Mark:] Remove; NFC');
        if ($transliterator) {
            $normalized = $transliterator->transliterate($value);
            return $normalized !== false ? $normalized : $value;
        }

        return preg_replace('~[\p{M}]~u', '', normalizer_normalize($value, \Normalizer::FORM_D) ?: $value);
    }
}
