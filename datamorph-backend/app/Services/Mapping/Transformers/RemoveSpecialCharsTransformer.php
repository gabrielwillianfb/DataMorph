<?php

namespace App\Services\Mapping\Transformers;

class RemoveSpecialCharsTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        return preg_replace('/[^\p{L}\p{N}\s]/u', '', $value) ?? $value;
    }
}
