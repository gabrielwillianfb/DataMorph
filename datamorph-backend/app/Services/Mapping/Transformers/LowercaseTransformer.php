<?php

namespace App\Services\Mapping\Transformers;

class LowercaseTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }
        return mb_strtolower($value, 'UTF-8');
    }
}
