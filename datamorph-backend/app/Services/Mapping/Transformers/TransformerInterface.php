<?php

namespace App\Services\Mapping\Transformers;

interface TransformerInterface
{
    /**
     * Transforma e sanitiza um valor individual de acordo com a regra.
     *
     * @param mixed $value
     * @param array<string, mixed> $options
     * @return mixed
     */
    public function transform(mixed $value, array $options = []): mixed;
}
